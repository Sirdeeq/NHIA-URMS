const { Router } = require("express");
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const {
  createReport,
  listReports,
  getReport,
  updateReport,
  updateStatus,
  deleteReport,
} = require("../controllers/annualReport.controller");

const router = Router();

// ─── Shared validation rules ──────────────────────────────────────────────────

const reportRules = [
  body("general.year")
    .notEmpty().withMessage("Reporting year is required")
    .isInt({ min: 2000, max: 2100 }).withMessage("Invalid year"),
  body("general.state")
    .notEmpty().withMessage("State is required")
    .isString().trim(),
  body("general.approvedBudget2025")
    .optional({ nullable: true, checkFalsy: true })
    .isDecimal().withMessage("Approved budget must be a number"),
  body("general.totalAmountUtilized2025")
    .optional({ nullable: true, checkFalsy: true })
    .isDecimal().withMessage("Total amount utilized must be a number"),
];

// ─── Routes ───────────────────────────────────────────────────────────────────

router.get("/",                                          listReports);
router.get("/:referenceId",                              getReport);
router.post("/",          reportRules, validate,         createReport);
router.put("/:referenceId", reportRules, validate,       updateReport);
router.patch("/:referenceId/status",
  body("status").notEmpty().withMessage("Status is required"),
  validate,
  updateStatus
);
router.delete("/:referenceId",                           deleteReport);

module.exports = router;
