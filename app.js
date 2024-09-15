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

// storage
const storage = multer.diskStorage({
  destination: (_request, file, cb) => {
    const ext = require('node:path').extname(file.originalname);
    ext = ext.length > 1 ? ext : '.' + require('mime').extension(file.mimetype);
    require('node:crypto').pseudoRandomBytes(16, (err, raw) => {
      cb(null, 'public/uploads'/*(err ? undefined : raw.toString('hex') )+ ext*/);
    });
  }
});

// sort out our upload busienss
const upload = multer({storage});

app.use('/', indexRouter);
app.use('/users', usersRouter);

function uploadFiles(request, response) {
  console.log(request.body);
  console.log(request.files);
  response.json({message: 'successfully uploaded', status: 200});
}

async function processFiles() {
  const folder = path.join(__dirname, folder_name);

  fs.stat(folder, (err, stats) => {
    if (err)
      console.error(err);
  })

  console.log(stats);
  console.log(`isFile ? ${stats.isFile()}`)
}

app.post('/processor', upload.array('images'), uploadFiles);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
