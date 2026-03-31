const express = require("express");
const auth = require("../middleware/auth");
const permit = require("../middleware/role");
const upload = require("../middleware/upload");
const { applyJob, myApplications } = require("../controllers/applicationController");

const router = express.Router();

router.post("/", auth, permit("job_seeker"), upload.single("resume"), applyJob);
router.get("/me", auth, permit("job_seeker"), myApplications);

module.exports = router;
