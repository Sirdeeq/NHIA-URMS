require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const sequelize = require("./config/database");
// Register models & associations
require("./models/AnnualReport");
require("./models/QuarterlyData");

const annualReportRoutes = require("./routes/annualReport.routes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.use(morgan("dev"));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/annual-reports", annualReportRoutes);

// ─── 404 ─────────────────────────────────────────────────────────────────────

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

// ─── Error handler ────────────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅  MySQL connected");
    app.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error("❌  Cannot connect to DB:", err.message);
    process.exit(1);
  }
})();
