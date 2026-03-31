const pool = require("../config/db");

async function uploadResume(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "Resume file required" });
    const userId = req.user.id;
    const resumePath = req.file.path.replace(/\\/g, "/");

    const [result] = await pool.execute(
      "INSERT INTO resumes (user_id, resume_path, original_name) VALUES (?, ?, ?)",
      [userId, resumePath, req.file.originalname]
    );

    return res.status(201).json({
      message: "Resume uploaded",
      resumeId: result.insertId,
      resumePath
    });
  } catch (error) {
    return res.status(500).json({ message: "Resume upload failed", error: error.message });
  }
}

module.exports = { uploadResume };
