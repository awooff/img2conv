const express = require("express");
const logger = require("pino")();
const router = express.Router();
const magick = require("imagemagick");
const fs = require("fs");
const { readdir, unlink } = require("node:fs/promises");
const path = require("node:path");
const util = require("util");
const archiver = require("archiver");
const convert = util.promisify(magick.convert);
const uploads_folder = path.join(__dirname, "..", "public/uploads/");

router.post("/processor", async (request, response) => {
  logger.warn("Processing files...");
  try {
    const convertedFiles = await processFiles(request.body.extension);
    logger.info(`Converted files: ${JSON.stringify(convertedFiles)}`);

    if (convertedFiles.length > 0) {
      logger.info("Creating zip file...");
      const zipFilePath = path.join(
        uploads_folder,
        `converted_files_${Date.now()}.zip`,
      );
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver("zip", {
        zlib: { level: 9 },
      });

      output.on("close", function () {
        logger.info("Archive created successfully");
        // Send the zip file as a download
        response.download(zipFilePath, path.basename(zipFilePath), (err) => {
          if (err) {
            logger.error("Error sending zip file:", err);
            response.status(500).json({ message: "Error sending zip file" });
          } else {
            // Delete the zip file after sending
            fs.unlink(zipFilePath, (unlinkErr) => {
              if (unlinkErr) {
                logger.error("Error deleting zip file:", unlinkErr);
              }
            });
          }
        });
      });

      archive.on("error", function (err) {
        logger.error("Error creating archive:", err);
        response.status(500).json({ message: "Error creating archive" });
      });

      archive.pipe(output);

      convertedFiles.forEach((file) => {
        logger.info(`Adding file to archive: ${file}`);
        archive.file(file, { name: path.basename(file) });
      });

      logger.info("Finalizing archive...");

      await archive.finalize();
    } else {
      logger.warn("No files processed");
      response.status(404).json({ message: "No files processed", status: 404 });
    }
  } catch (error) {
    logger.error("Error processing files:", error);
    response
      .status(500)
      .json({ message: "Error processing files", status: 500 });
  }
});

async function processFiles(extension) {
  const files = await readdir(uploads_folder);
  logger.info("Files in directory:", files);

  const convertedFiles = [];
  await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(uploads_folder, file);
      logger.info("Attempting to process file:", filePath);

      if (!fs.existsSync(filePath)) {
        logger.info(`File does not exist: ${filePath}`);
        return;
      }

      let _file = path.parse(filePath);
      logger.info("File exists, parsed path:", _file);

      try {
        const metadata = await util.promisify(magick.readMetadata)(filePath);
        logger.info(
          `file ${_file.name}, shot at ${metadata.exif?.dateTimeOriginal || "unknown! :("}`,
        );

        const outputPath = path.join(
          uploads_folder,
          `${_file.name}.${extension}`,
        );
        await convert([filePath, outputPath]);

        logger.info(`Successfully converted ${file} to ${extension}`);
        convertedFiles.push(outputPath);

        if (filePath !== outputPath) {
          await unlink(filePath);
        }
      } catch (err) {
        logger.error(`Error processing file ${file}:`, err);
      }
    }),
  );

  return convertedFiles;
}

module.exports = router;
