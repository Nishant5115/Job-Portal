const pool = require("../config/db");

async function recruiterDashboard(req, res) {
  try {
    const recruiterId = req.user.id;
    const [[jobStats]] = await pool.execute(
      "SELECT COUNT(*) AS total_jobs FROM jobs WHERE recruiter_id = ?",
      [recruiterId]
    );
    const [[applicationStats]] = await pool.execute(
      `SELECT COUNT(*) AS total_applications
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE j.recruiter_id = ?`,
      [recruiterId]
    );
    return res.json({ ...jobStats, ...applicationStats });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load recruiter dashboard", error: error.message });
  }
}

async function adminDashboard(req, res) {
  try {
    const [[users]] = await pool.execute("SELECT COUNT(*) AS total_users FROM users");
    const [[jobs]] = await pool.execute("SELECT COUNT(*) AS total_jobs FROM jobs");
    const [[applications]] = await pool.execute("SELECT COUNT(*) AS total_applications FROM applications");
    return res.json({ ...users, ...jobs, ...applications });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load admin dashboard", error: error.message });
  }
}

module.exports = { recruiterDashboard, adminDashboard };
