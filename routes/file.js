const express = require("express");
const fileController = require("../controllers/fileController");
const router = express.Router();
const upload = require("../config/storageConfig");

router.post(
  "/createFile",
  upload.array("photos", 100),
  fileController.createFile
);

router.post("/fetchFile", fileController.fetchFile);

router.put("/updateFile", fileController.updateFile);

module.exports = router;
