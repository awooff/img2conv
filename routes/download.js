const express = require("express");
const logger = require("pino")();
const router = express.Router();
const magick = require("imagemagick");
const fs = require("fs");
const path = require("node:path");
const util = require("util");
const archiver = require("archiver");
const convert = util.promisify(magick.convert);
const uploads_folder = path.join(__dirname, "..", "public/uploads/");

router.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploads_folder, filename);

  res.download(filePath, "converted_files.zip", (err) => {
    if (err) {
      logger.error("Error downloading file:", err);
      res.status(500).send("Error downloading file");
    }

    // Delete the file after download
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) logger.error("Error deleting zip file:", unlinkErr);
    });
  });
});

module.exports = router;
