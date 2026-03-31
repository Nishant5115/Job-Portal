const express = require("express");
const auth = require("../middleware/auth");
const { myNotifications } = require("../controllers/notificationController");

const router = express.Router();

router.get("/me", auth, myNotifications);

module.exports = router;
