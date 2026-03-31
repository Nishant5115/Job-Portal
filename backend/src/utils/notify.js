const pool = require("../config/db");
const mailer = require("../config/mailer");

async function createNotification(userId, subject, message, sendEmail = false) {
  await pool.execute(
    "INSERT INTO notifications (user_id, subject, message) VALUES (?, ?, ?)",
    [userId, subject, message]
  );

  if (!sendEmail) return;

  const [users] = await pool.execute("SELECT email FROM users WHERE id = ?", [userId]);
  if (!users.length) return;

  const recipient = users[0].email;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  await mailer.sendMail({
    from: process.env.EMAIL_USER,
    to: recipient,
    subject,
    text: message
  });
}

module.exports = { createNotification };
