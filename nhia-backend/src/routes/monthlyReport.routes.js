const { Router } = require("express");
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const ctrl = require("../controllers/monthlyReport.controller");

const router = Router();

const baseRules = [
  body("state_id").notEmpty().withMessage("state_id is required"),
  body("reporting_year").isInt({ min: 2000, max: 2100 }).withMessage("Invalid year"),
  body("reporting_month").isInt({ min: 1, max: 12 }).withMessage("Month must be 1-12"),
];

// ── Finance ───────────────────────────────────────────────────────────────────
router.get("/finance",              ctrl.finance.list);
router.get("/finance/aggregate",    ctrl.finance.aggregate);
router.get("/finance/:id",          ctrl.finance.get);
router.post("/finance",             baseRules, validate, ctrl.finance.create);
router.put("/finance/:id",          ctrl.finance.update);
router.patch("/finance/:id/status", body("status").notEmpty(), validate, ctrl.finance.updateStatus);

// ── Programmes ────────────────────────────────────────────────────────────────
router.get("/programmes",              ctrl.programmes.list);
router.get("/programmes/aggregate",    ctrl.programmes.aggregate);
router.get("/programmes/:id",          ctrl.programmes.get);
router.post("/programmes",             baseRules, validate, ctrl.programmes.create);
router.put("/programmes/:id",          ctrl.programmes.update);
router.patch("/programmes/:id/status", body("status").notEmpty(), validate, ctrl.programmes.updateStatus);

// ── SQA ───────────────────────────────────────────────────────────────────────
router.get("/sqa",              ctrl.sqa.list);
router.get("/sqa/aggregate",    ctrl.sqa.aggregate);
router.get("/sqa/:id",          ctrl.sqa.get);
router.post("/sqa",             baseRules, validate, ctrl.sqa.create);
router.put("/sqa/:id",          ctrl.sqa.update);
router.patch("/sqa/:id/status", body("status").notEmpty(), validate, ctrl.sqa.updateStatus);

module.exports = router;
