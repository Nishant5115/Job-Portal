const pool = require("../config/db");
const { createNotification } = require("../utils/notify");

async function applyJob(req, res) {
  try {
    const userId = req.user.id;
    const body = req.body || {};
    const jobId = body.jobId || body.job_id;
    const coverLetter = body.cover_letter || null;

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

    const [existing] = await pool.execute(
      "SELECT id FROM applications WHERE user_id = ? AND job_id = ?",
      [userId, jobIdNum]
    );
    if (existing.length) return res.status(409).json({ message: "Already applied to this job" });

    let resumePath;
    if (req.file) {
      // Save uploaded resume and use it for this application.
      resumePath = req.file.path.replace(/\\/g, "/");
      await pool.execute(
        "INSERT INTO resumes (user_id, resume_path, original_name) VALUES (?, ?, ?)",
        [userId, resumePath, req.file.originalname]
      );
    } else {
      const [resumeRows] = await pool.execute(
        "SELECT resume_path FROM resumes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
        [userId]
      );
      if (!resumeRows.length) return res.status(400).json({ message: "Upload resume before applying" });
      resumePath = resumeRows[0].resume_path;
    }

    const [result] = await pool.execute(
      "INSERT INTO applications (user_id, job_id, resume_path, cover_letter) VALUES (?, ?, ?, ?)",
      [userId, jobIdNum, resumePath, coverLetter]
    );

    const [jobOwner] = await pool.execute("SELECT recruiter_id FROM jobs WHERE id = ?", [jobIdNum]);
    if (jobOwner.length) {
      await createNotification(
        jobOwner[0].recruiter_id,
        "New Job Application",
        `A new candidate has applied for job #${jobIdNum}.`,
        true
      );
    }

    return res.status(201).json({ message: "Application submitted", applicationId: result.insertId });
  } catch (error) {
    return res.status(500).json({ message: "Application failed", error: error.message });
  }
}

async function myApplications(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT a.*, j.title, j.location
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.user_id = ?
       ORDER BY a.created_at DESC`,
      [req.user.id]
    );
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch applications", error: error.message });
  }
}

module.exports = { applyJob, myApplications };
