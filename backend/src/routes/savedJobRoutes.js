const express = require("express");
const auth = require("../middleware/auth");
const permit = require("../middleware/role");
const { saveJob, mySavedJobs } = require("../controllers/savedJobController");

const router = express.Router();

router.post("/", auth, permit("job_seeker"), saveJob);
router.get("/me", auth, permit("job_seeker"), mySavedJobs);

module.exports = router;
