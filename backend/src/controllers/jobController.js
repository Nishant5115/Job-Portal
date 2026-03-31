const pool = require("../config/db");
const { createNotification } = require("../utils/notify");

async function postJob(req, res) {
  try {
    const recruiterId = req.user.id;
    const { title, description, location, salary, employment_type } = req.body || {};
    if (!title || !description || !location) {
      return res.status(400).json({ message: "title, description and location are required" });
    }
    const [result] = await pool.execute(
      `INSERT INTO jobs (recruiter_id, title, description, location, salary, employment_type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [recruiterId, title, description, location, salary, employment_type]
    );
    return res.status(201).json({ message: "Job created", jobId: result.insertId });
  } catch (error) {
    return res.status(500).json({ message: "Failed to post job", error: error.message });
  }
}

async function listJobs(req, res) {
  try {
    const { keyword, location, minSalary, maxSalary, employmentType } = req.query;
    const filters = [];
    const params = [];

    if (keyword) {
      filters.push("(j.title LIKE ? OR j.description LIKE ?)");
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (location) {
      filters.push("j.location LIKE ?");
      params.push(`%${location}%`);
    }
    if (minSalary) {
      filters.push("j.salary >= ?");
      params.push(Number(minSalary));
    }
    if (maxSalary) {
      filters.push("j.salary <= ?");
      params.push(Number(maxSalary));
    }
    if (employmentType) {
      filters.push("j.employment_type = ?");
      params.push(employmentType);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const query = `
      SELECT j.*, u.name AS recruiter_name
      FROM jobs j
      JOIN users u ON j.recruiter_id = u.id
      ${where}
      ORDER BY j.created_at DESC
    `;

    const [rows] = await pool.execute(query, params);
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch jobs", error: error.message });
  }
}

async function getRecruiterJobs(req, res) {
  try {
    const [rows] = await pool.execute("SELECT * FROM jobs WHERE recruiter_id = ? ORDER BY created_at DESC", [req.user.id]);
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch recruiter jobs", error: error.message });
  }
}

async function updateApplicationStatus(req, res) {
  try {
    const recruiterId = req.user.id;
    const { applicationId } = req.params;
    const { status } = req.body || {};
    const allowed = ["applied", "reviewed", "shortlisted", "rejected", "hired"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const [rows] = await pool.execute(
      `SELECT a.id, a.user_id, j.id AS job_id
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.id = ? AND j.recruiter_id = ?`,
      [applicationId, recruiterId]
    );
    if (!rows.length) return res.status(404).json({ message: "Application not found" });

    await pool.execute("UPDATE applications SET status = ? WHERE id = ?", [status, applicationId]);

    const app = rows[0];
    await createNotification(
      app.user_id,
      "Application Status Updated",
      `Your application #${applicationId} has been updated to: ${status}`,
      true
    );

    return res.json({ message: "Application status updated" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update status", error: error.message });
  }
}

module.exports = { postJob, listJobs, getRecruiterJobs, updateApplicationStatus };
