const express = require("express");
const auth = require("../middleware/auth");
const permit = require("../middleware/role");
const { recruiterDashboard, adminDashboard } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/recruiter", auth, permit("recruiter"), recruiterDashboard);
router.get("/admin", auth, permit("admin"), adminDashboard);

module.exports = router;
