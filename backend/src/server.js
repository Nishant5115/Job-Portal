require("dotenv").config();
const app = require("./app");
const pool = require("./config/db");

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await pool.query("SELECT 1");
    app.listen(PORT, () => {
      console.log(`Server running on port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("DB connection failed:", error.message);
    process.exit(1);
  }
}

start();
