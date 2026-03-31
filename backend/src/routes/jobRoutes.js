const express = require("express");
const auth = require("../middleware/auth");
const permit = require("../middleware/role");
const {
  postJob,
  listJobs,
  getRecruiterJobs,
  updateApplicationStatus
} = require("../controllers/jobController");

const router = express.Router();

router.get("/", listJobs);
router.post("/", auth, permit("recruiter"), postJob);
router.get("/recruiter/my-jobs", auth, permit("recruiter"), getRecruiterJobs);
router.patch("/applications/:applicationId/status", auth, permit("recruiter"), updateApplicationStatus);

module.exports = router;
