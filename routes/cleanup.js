const express = require("express");
const logger = require("pino")();
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");

const uploads_folder = path.join(__dirname, "..", "public/uploads/");

router.get("/cleanup", async (request, response) => {
  try {
    logger.info(`Starting cleanup in folder: ${uploads_folder}`);
    const files = await fs.readdir(uploads_folder);
    logger.info(`Found ${files.length} items in the folder`);

    for (const file of files) {
      const filePath = path.join(uploads_folder, file);
      try {
        const stats = await fs.stat(filePath);
        if (stats.isDirectory()) {
          logger.warn(`Skipping directory: ${file}`);
          continue;
        }
        await fs.unlink(filePath);
        logger.info(`Successfully deleted: ${file}`);
      } catch (err) {
        logger.error(`Error processing ${file}:`, err);
      }
    }

    const remainingFiles = await fs.readdir(uploads_folder);
    if (remainingFiles.length === 0) {
      logger.info("All files successfully deleted. Folder is empty.");
    } else {
      logger.warn(
        `Cleanup incomplete. ${remainingFiles.length} items remain:`,
        remainingFiles,
      );
    }

    response.send("Cleanup completed");
  } catch (err) {
    logger.error("Error during cleanup:", err);
    response.status(500).send("Error during cleanup");
  }
});

module.exports = router;
