const express = require("express");
const router = express.Router();
const magick = require("imagemagick");
const fs = require("fs");
const { readdir, unlink } = require("node:fs/promises");
const path = require("node:path");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const uploads_folder = path.join(__dirname, "..", "public/uploads/");

router.post("/processor", async (request, response) => {
  try {
    await processFiles();
    response.json({ message: "Successfully processed files", status: 200 });
  } catch (error) {
    console.error("Error processing files:", error);
    response
      .status(500)
      .json({ message: "Error processing files", status: 500 });
  } finally {
    debugger;
    await cleanup();
  }
});

async function cleanup() {
  try {
    const files = await readdir(uploads_folder);

    for (const file of files) {
      await unlink(path.join(uploads_folder, file));
    }

    console.warn("Cleaned up the uploads folder :) ready to go!");
  } catch (err) {
    console.error("Error during cleanup:", err);
  }
}

async function processFiles() {
  try {
    const files = await readdir(uploads_folder);
    console.log("Files in directory:", files);

    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(uploads_folder, file);
        console.log("Attempting to process file:", filePath); // Add this line

        if (!fs.existsSync(filePath)) {
          console.log(`File does not exist: ${filePath}`);
        }

        let _file = path.parse(filePath);
        if (_file.name === ".gitignore") return;

        console.log("File exists, parsed path:", _file); // Add this line

        try {
          const metadata = await new Promise((resolve, reject) => {
            magick.readMetadata(filePath, (err, metadata) => {
              // Change _file.path to filePath
              if (err) reject(err);
              else resolve(metadata);
            });
          });
          console.log(
            `File: ${_file.name}, Shot at: ${metadata.exif?.dateTimeOriginal || "Unknown"}`,
          );

          const output_path = path.join(uploads_folder, `${_file.name}.png`);
          const command = `convert "${filePath}" "${output_path}"`;
          const { stdout, stderr } = await exec(command);

          if (stderr) {
            console.error(`Error converting ${file} to PNG:`, stderr);
          }

          console.log(`Successfully converted ${file} to PNG`);
          await unlink(filePath);

          // the secret sauce
          response.sendFiles(file);
        } catch (err) {
          console.error(`Error processing file ${file}:`, err);
        }
      }),
    );
  } catch (err) {
    console.error("Error reading directory:", err);
    throw err;
  }
}

async function sendFiles() {}
module.exports = router;
