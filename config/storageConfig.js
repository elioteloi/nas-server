const multer = require("multer");
require("dotenv").config();
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${process.env.PATH_OF_DRIVE}/tempDir`);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();

    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
