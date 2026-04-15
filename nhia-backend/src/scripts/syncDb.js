/**
 * Run once to create / update all tables:
 *   node src/scripts/syncDb.js
 *
 * Use { force: true } to DROP and recreate (destructive — dev only).
 */
require("dotenv").config();
const sequelize = require("../config/database");

// Import models so Sequelize registers them before sync
require("../models/AnnualReport");
require("../models/QuarterlyData"); // also sets up associations

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅  DB connection OK");

    await sequelize.sync({ alter: true });
    console.log("✅  Tables synced");

    process.exit(0);
  } catch (err) {
    console.error("❌  Sync failed:", err);
    process.exit(1);
  }
})();
