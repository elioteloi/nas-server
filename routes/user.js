const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/createUser", userController.createUser);

router.post("/fetchUser", userController.fetchUser);

module.exports = router;
