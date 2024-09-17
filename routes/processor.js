const express = require("express");
const router = express.Router();
const magick = require("imagemagick");
const fs = require("fs");
const { readdir, unlink } = require("node:fs/promises");
const path = require("node:path");
const util = require("util");
const convert = util.promisify(magick.convert);
const uploads_folder = path.join(__dirname, "..", "public/uploads/");

router.post("/processor", async (request, response) => {
  try {
    const convertedFiles = await processFiles(request.body.extension);
    response.json({
      message: "Successfully processed files",
      status: 200,
      files: convertedFiles,
    });
  } catch (error) {
    console.error("Error processing files:", error);
    response
      .status(500)
      .json({ message: "Error processing files", status: 500 });
  } finally {
    // await cleanup();
  }
});

async function cleanup() {
  try {
    const files = await readdir(uploads_folder);
    for (const file of files) {
      if (!file.endsWith(".png")) {
        // Only delete non-PNG files
        await unlink(path.join(uploads_folder, file));
      }
    }
    console.warn("Cleaned up the uploads folder :) ready to go!");
  } catch (err) {
    console.error("Error during cleanup:", err);
  }
}

async function processFiles(extension) {
  const files = await readdir(uploads_folder);
  console.log("Files in directory:", files);

  const convertedFiles = [];
  await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(uploads_folder, file);
      console.log("Attempting to process file:", filePath);

      if (!fs.existsSync(filePath)) {
        console.log(`File does not exist: ${filePath}`);
        return;
      }

      let _file = path.parse(filePath);
      console.log("File exists, parsed path:", _file);

      try {
        const metadata = await util.promisify(magick.readMetadata)(filePath);
        console.log(
          `file ${_file.name}, shot at ${metadata.exif?.dateTimeOriginal || "unknown! :("}`,
        );

        const outputPath = path.join(
          uploads_folder,
          `${_file.name}.${extension}`,
        );
        await convert([filePath, outputPath]);

        console.log(`Successfully converted ${file} to ${extension}`);
        convertedFiles.push(outputPath);

        if (filePath !== outputPath) {
          await unlink(filePath);
        }
      } catch (err) {
        console.error(`Error processing file ${file}:`, err);
      }
    }),
  );

  return convertedFiles;
}

module.exports = router;
