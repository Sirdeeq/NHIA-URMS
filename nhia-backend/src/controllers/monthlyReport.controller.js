const sequelize = require("../config/database");
const { FinanceMonthlyReport, ProgrammesMonthlyReport, SqaMonthlyReport, StateOffice } = require("../models");

const MONTH_NAMES = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ── Reference ID generator ────────────────────────────────────────────────────
const genRefId = async (Model, prefix, t) => {
  const year = new Date().getFullYear();
  const count = await Model.count({ transaction: t });
  return `${prefix}-${year}-${String(count + 1).padStart(5, "0")}`;
};

// ── Generic CRUD factory ──────────────────────────────────────────────────────
const makeController = (Model, prefix) => ({

  create: async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
      const reference_id = await genRefId(Model, prefix, t);
      const record = await Model.create(
        { reference_id, ...req.body, status: req.body.status || "draft" },
        { transaction: t }
      );
      await t.commit();
      res.status(201).json({ success: true, data: record });
    } catch (err) { await t.rollback(); next(err); }
  },

  list: async (req, res, next) => {
    try {
      const where = {};
      if (req.query.state_id) where.state_id = req.query.state_id;
      if (req.query.year)     where.reporting_year  = req.query.year;
      if (req.query.month)    where.reporting_month = req.query.month;
      if (req.query.status)   where.status = req.query.status;
      if (req.query.section)  where.section = req.query.section;
      const records = await Model.findAll({
        where,
        include: [{ model: StateOffice, as: "state", attributes: ["id","description"] }],
        order: [["reporting_year","DESC"],["reporting_month","DESC"]],
      });
      res.json({ success: true, data: records });
    } catch (err) { next(err); }
  },

  get: async (req, res, next) => {
    try {
      const record = await Model.findByPk(req.params.id, {
        include: [{ model: StateOffice, as: "state", attributes: ["id","description"] }],
      });
      if (!record) return res.status(404).json({ success: false, message: "Not found" });
      res.json({ success: true, data: record });
    } catch (err) { next(err); }
  },

  update: async (req, res, next) => {
    try {
      const record = await Model.findByPk(req.params.id);
      if (!record) return res.status(404).json({ success: false, message: "Not found" });
      await record.update(req.body);
      res.json({ success: true, data: record });
    } catch (err) { next(err); }
  },

  updateStatus: async (req, res, next) => {
    try {
      const { status } = req.body;
      if (!["draft","submitted","approved"].includes(status))
        return res.status(422).json({ success: false, message: "Invalid status" });
      const record = await Model.findByPk(req.params.id);
      if (!record) return res.status(404).json({ success: false, message: "Not found" });
      await record.update({ status });
      res.json({ success: true, data: record });
    } catch (err) { next(err); }
  },

  // Aggregate all months for a state+year into annual totals
  aggregate: async (req, res, next) => {
    try {
      const { state_id, year } = req.query;
      if (!state_id || !year)
        return res.status(422).json({ success: false, message: "state_id and year required" });
      const records = await Model.findAll({
        where: { state_id, reporting_year: year },
        order: [["reporting_month","ASC"]],
      });
      res.json({ success: true, data: records, count: records.length });
    } catch (err) { next(err); }
  },
});

module.exports = {
  finance:    makeController(FinanceMonthlyReport,    "FIN"),
  programmes: makeController(ProgrammesMonthlyReport, "PRG"),
  sqa:        makeController(SqaMonthlyReport,        "SQA"),
};
