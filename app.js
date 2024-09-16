const createError = require("http-errors");
const express = require("express");
const favicon = require("serve-favicon");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const helmet = require("helmet");
const stylus = require("stylus");
const multer = require("multer");
const magick = require("imagemagick");

const indexRouter = require("./routes/index");
const processorRouter = require("./routes/processor");

const app = express();
logger("tiny");

// before even bothering to start, check imagemagick exists on the system first.
magick.identify(["--version"], (error, output) => {
  if (error) {
    console.error("ImageMagick not properly installed:", error);
    require("node:process").exit(1);
  } else {
    // do we *really* want this showing every time?
    // console.log(output);
  }
});

// all done? good!

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(stylus.middleware(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public")));

// file filter for handling badness
function fileFilter(_request, _response, cb) {
  const badtypes =
    /.mp4|.avi|.wav|.mp3|.app|.exe|.so|.dylib|.sh|.bash|.zsh|.a|.tiff/;
  if (badtypes) cb("err: these are vv bad :(((");
  else cb(null, true);
}

const storage = multer.diskStorage({
  fileFilter, // gotta add our filter
  destination:
    "public/uploads" /*(err ? undefined : raw.toString('hex') )+ ext*/,
  filename: (req, file, cb) =>
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname),
    ),
});

const upload = multer({ storage });

app.get("/", indexRouter);
app.post("/processor", upload.array("images"), processorRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
