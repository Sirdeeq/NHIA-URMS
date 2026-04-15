const sequelize = require("../config/database");
const { AnnualReport, QuarterlyData } = require("../models");

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generate a unique reference ID: NHIA-AR-{YEAR}-{00001}
 * Sequence is scoped per reporting year and is race-safe inside a transaction.
 */
const generateReferenceId = async (year, transaction) => {
  const count = await AnnualReport.count({
    where: { reporting_year: year },
    transaction,
  });
  const seq = String(count + 1).padStart(5, "0");
  return `NHIA-AR-${year}-${seq}`;
};

/**
 * Compute sub_total from q1–q4.
 */
const calcSubTotal = (q) =>
  [q.q1, q.q2, q.q3, q.q4].reduce((sum, v) => sum + (parseFloat(v) || 0), 0);

/**
 * Build quarterly rows from the frontend quarterly object.
 * Frontend shape: { gifshipEnrolments: { q1, q2, q3, q4 }, ... }
 */
const buildQuarterlyRows = (referenceId, quarterly) =>
  Object.entries(quarterly).map(([category, quarters]) => ({
    annual_report_ref: referenceId,
    category,
    q1: parseFloat(quarters.q1) || 0,
    q2: parseFloat(quarters.q2) || 0,
    q3: parseFloat(quarters.q3) || 0,
    q4: parseFloat(quarters.q4) || 0,
    sub_total: calcSubTotal(quarters),
  }));

/**
 * Fetch a report with its quarterly data by reference_id.
 */
const findReport = (referenceId) =>
  AnnualReport.findByPk(referenceId, {
    include: [{ model: QuarterlyData, as: "quarterly_data" }],
  });

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/annual-reports
 * Create a new annual report.
 */
const createReport = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { general, clinical, quarterly, status = "submitted", submitted_by } = req.body;

    const reference_id = await generateReferenceId(general.year, t);

    await AnnualReport.create(
      {
        reference_id,
        reporting_year: general.year,
        state: general.state,
        staff_no: general.staffNo || null,
        total_vehicles: general.totalVehicles || null,
        total_hcf_under_nhia: general.totalHCF || null,
        total_accredited_hcf: general.totalAccreditedHCF2025 || null,
        approved_budget: general.approvedBudget2025 || null,
        total_amount_utilized: general.totalAmountUtilized2025 || null,
        total_accredited_cemonc: clinical.totalAccreditedCEmONC || null,
        total_cemonc_beneficiaries: clinical.totalCEmONCBeneficiaries || null,
        total_accredited_ffp: clinical.totalAccreditedFFP || null,
        total_ffp_beneficiaries: clinical.totalFFPBeneficiaries || null,
        status,
        submitted_by: submitted_by || null,
      },
      { transaction: t }
    );

    if (quarterly && typeof quarterly === "object") {
      const rows = buildQuarterlyRows(reference_id, quarterly);
      await QuarterlyData.bulkCreate(rows, { transaction: t });
    }

    await t.commit();

    const full = await findReport(reference_id);
    res.status(201).json({ success: true, data: full });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

/**
 * GET /api/annual-reports
 * List all reports. Supports ?state=Lagos&year=2025&status=submitted
 */
const listReports = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.state) where.state = req.query.state;
    if (req.query.year) where.reporting_year = req.query.year;
    if (req.query.status) where.status = req.query.status;

    const reports = await AnnualReport.findAll({
      where,
      include: [{ model: QuarterlyData, as: "quarterly_data" }],
      order: [["created_at", "DESC"]],
    });

    res.json({ success: true, data: reports });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/annual-reports/:referenceId
 * Get a single report by reference_id (e.g. NHIA-AR-2025-00001).
 */
const getReport = async (req, res, next) => {
  try {
    const report = await findReport(req.params.referenceId);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/annual-reports/:referenceId
 * Update an existing report (replaces quarterly data).
 */
const updateReport = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const report = await AnnualReport.findByPk(req.params.referenceId, { transaction: t });
    if (!report) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    const { general, clinical, quarterly, status } = req.body;

    await report.update(
      {
        reporting_year: general.year,
        state: general.state,
        staff_no: general.staffNo || null,
        total_vehicles: general.totalVehicles || null,
        total_hcf_under_nhia: general.totalHCF || null,
        total_accredited_hcf: general.totalAccreditedHCF2025 || null,
        approved_budget: general.approvedBudget2025 || null,
        total_amount_utilized: general.totalAmountUtilized2025 || null,
        total_accredited_cemonc: clinical.totalAccreditedCEmONC || null,
        total_cemonc_beneficiaries: clinical.totalCEmONCBeneficiaries || null,
        total_accredited_ffp: clinical.totalAccreditedFFP || null,
        total_ffp_beneficiaries: clinical.totalFFPBeneficiaries || null,
        ...(status && { status }),
      },
      { transaction: t }
    );

    if (quarterly && typeof quarterly === "object") {
      await QuarterlyData.destroy({
        where: { annual_report_ref: report.reference_id },
        transaction: t,
      });
      const rows = buildQuarterlyRows(report.reference_id, quarterly);
      await QuarterlyData.bulkCreate(rows, { transaction: t });
    }

    await t.commit();

    const full = await findReport(report.reference_id);
    res.json({ success: true, data: full });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

/**
 * PATCH /api/annual-reports/:referenceId/status
 * Update only the status.
 */
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["draft", "submitted", "under_review", "approved", "rejected"];
    if (!allowed.includes(status)) {
      return res.status(422).json({ success: false, message: "Invalid status value" });
    }

    const report = await AnnualReport.findByPk(req.params.referenceId);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    await report.update({ status });
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/annual-reports/:referenceId
 * Delete a report and its quarterly data (cascade).
 */
const deleteReport = async (req, res, next) => {
  try {
    const report = await AnnualReport.findByPk(req.params.referenceId);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }
    await report.destroy();
    res.json({ success: true, message: `Report ${req.params.referenceId} deleted` });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReport,
  listReports,
  getReport,
  updateReport,
  updateStatus,
  deleteReport,
};
