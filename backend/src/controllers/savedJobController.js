const pool = require("../config/db");

async function saveJob(req, res) {
  try {
    const userId = req.user.id;
    const { jobId } = req.body || {};
    if (!jobId) {
      return res.status(400).json({ message: "jobId is required" });
    }
    const jobIdNum = Number(jobId);
    if (Number.isNaN(jobIdNum) || jobIdNum <= 0) {
      return res.status(400).json({ message: "jobId must be a valid number" });
    }

    const [jobRows] = await pool.execute("SELECT id FROM jobs WHERE id = ?", [jobIdNum]);
    if (!jobRows.length) {
      return res.status(400).json({ message: "Invalid jobId (job not found)" });
    }

    await pool.execute("INSERT IGNORE INTO saved_jobs (user_id, job_id) VALUES (?, ?)", [userId, jobIdNum]);
    return res.status(201).json({ message: "Job saved" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to save job", error: error.message });
  }
}

async function mySavedJobs(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT sj.id, j.*
       FROM saved_jobs sj
       JOIN jobs j ON sj.job_id = j.id
       WHERE sj.user_id = ?
       ORDER BY sj.created_at DESC`,
      [req.user.id]
    );
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch saved jobs", error: error.message });
  }
}

module.exports = { saveJob, mySavedJobs };
