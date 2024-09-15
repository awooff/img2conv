const createError = require('http-errors');
const express = require('express');
const favicon = require('serve-favicon')
const path = require('path');
const fs = require('node:fs/promises');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const stylus = require('stylus');
const multer = require('multer');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const processorRouter = require('./routes/processor');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// file filter for handling badness
function fileFilter(_request, _response, cb) {
  const badtypes = /.mp4|.avi|.wav|.mp3|.app|.exe|.so|.dylib|.sh|.bash|.zsh|.a|.tiff/;
  if (badtypes)
    cb('err: these are vv bad :(((')
  else
    cb(null, true);
}

const storage = multer.diskStorage({
  fileFilter, // gotta add our filter
  destination: (_request, file, cb) => {
    let ext = require('node:path').extname(file.originalname);
    ext = ext.length > 1 ? ext : '.' + require('mime').extension(file.mimetype);
    require('node:crypto').pseudoRandomBytes(16, (err, raw) => {
      cb(null, 'public/uploads'/*(err ? undefined : raw.toString('hex') )+ ext*/);
    });
  }
});

const upload = multer({storage});

app.use('/', indexRouter);
app.use('/users', usersRouter);

async function processFiles(request, response) {
  console.log('ive just been called! this is a test');
  const folder_name = 'public/uploads/';
  const folder = path.join(__dirname, folder_name);

  await fs.stat(folder, (err, stats) => {
    if (err)
      console.error(err);

    console.log(stats);
    console.log(`isFile ? ${stats.isFile()}`)
  }).then(async () => {
    const magick = require('imagemagick');
    let data = [];
    // TODO: code is broken here :(
    // await fs.readdir(folder).forEach(element => {
    //   element.push(data);
    // });
    //
    // for (let image of data) {
    //   magick.convert(image, String(`${require('node:crypto').randomBytes(16)}.jpg`), ((err, out) => {
    //     if (err)
    //       response.status(500);
    //     
    //     response.sendFile(out);
    //   }))
    // }
  })
}

function uploadFiles(request, response) {
  console.log(request.body);
  console.log(request.files);
  response.json({message: 'successfully uploaded', status: 200});
  processFiles(request, response);
}

app.post('/upload', upload.array('images'), uploadFiles);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
