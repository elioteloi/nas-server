const express = require("express");
const fileController = require("../controllers/fileController");
const router = express.Router();
const upload = require("../config/storageConfig");

router.post(
  "/createFile",
  upload.array("photos", 100),
  fileController.createFile
);

module.exports = router;
