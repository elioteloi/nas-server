const express = require("express");
const folderController = require("../controllers/folderController");
const router = express.Router();

router.post("/createFolder", folderController.createFolder);

router.post("/fetchFolder", folderController.fetchFolder);

module.exports = router;
