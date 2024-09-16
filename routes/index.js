const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", function (req, response, next) {
  response.render("index", { title: "img2conv" });
});

module.exports = router;
