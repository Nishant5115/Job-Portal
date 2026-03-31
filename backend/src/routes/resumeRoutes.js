const express = require("express");
const auth = require("../middleware/auth");
const permit = require("../middleware/role");
const upload = require("../middleware/upload");
const { uploadResume } = require("../controllers/resumeController");

const router = express.Router();

router.post("/", auth, permit("job_seeker"), upload.single("resume"), uploadResume);

module.exports = router;
