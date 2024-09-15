const express = require('express');
const router = express.Router();
const magick = require('imagemagick');

router.post('/processor', (request, response, next) => {
  const {files} = request;

  let count = 0;
  for (let file of files) {
    magick.readMetadata(file, (err, metadata) => {
      if (err)
        response.statusCode(500);

      console.log(`shot at ${metadata.exif.dateTimeOriginal}`);
        
      let _file = magick.convert([file, `file-${count}.jpg`]);

      response.sendFile(_file);
      ++count;
    })
  }
  
});

module.exports = router;
