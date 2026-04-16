const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const { User, ZonalOffice, StateOffice, Department, Unit } = require("../models");
const { ROLES } = require("../models/User");

// ─── Helpers ──────────────────────────────────────────────────────────────────
const paginate = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  return { limit, offset: (page - 1) * limit, page };
};

const notFound = (res, entity) =>
  res.status(404).json({ success: false, message: `${entity} not found` });

// ═══════════════════════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════════════════════

const listUsers = async (req, res, next) => {
  try {
    const { limit, offset, page } = paginate(req.query);
    const where = {};
    if (req.query.role) where.role = req.query.role;
    if (req.query.zone_id) where.zone_id = req.query.zone_id;
    if (req.query.state_id) where.state_id = req.query.state_id;
    if (req.query.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${req.query.search}%` } },
        { staff_id: { [Op.like]: `%${req.query.search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      limit,
      offset,
      attributes: { exclude: ["password"] },
      include: [
        { association: "zone", attributes: ["id", "zonal_code", "description"] },
        { association: "state", attributes: ["id", "code", "description"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, data: rows, total: count, page, pages: Math.ceil(count / limit) });
  } catch (err) { next(err); }
};

const getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
      include: ["zone", "state"],
    });
    if (!user) return notFound(res, "User");
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

// Role → Staff ID prefix map
const ROLE_PREFIX = {
  "admin":          "ADMIN",
  "state-officer":  "SO",
  "zonal-director": "ZD",
  "sdo":            "SDO",
  "hq-department":  "HQ",
  "dg-ceo":         "DG",
};

const generateStaffId = async (role) => {
  const prefix = ROLE_PREFIX[role] || "USR";
  const count = await User.count({ where: { role } });
  return `${prefix}-${String(count + 1).padStart(4, "0")}`;
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, zone_id, state_id } = req.body;
    if (!name || !password || !role) {
      return res.status(400).json({ success: false, message: "name, password, role required" });
    }
    if (!ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: `Invalid role. Valid: ${ROLES.join(", ")}` });
    }
    const staff_id = await generateStaffId(role);
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, staff_id, email, password: hashed, role, zone_id, state_id });
    const { password: _pw, ...data } = user.toJSON();
    res.status(201).json({ success: true, data });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ success: false, message: "email already exists" });
    }
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return notFound(res, "User");

    const { name, email, role, zone_id, state_id, is_active, password } = req.body;
    const updates = { name, email, role, zone_id, state_id, is_active };
    if (password) updates.password = await bcrypt.hash(password, 12);

    // Remove undefined keys
    Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k]);

    if (updates.role && !ROLES.includes(updates.role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    await user.update(updates);
    const { password: _pw, ...data } = user.toJSON();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return notFound(res, "User");
    await user.destroy();
    res.json({ success: true, message: "User deleted" });
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ZONAL OFFICES
// ═══════════════════════════════════════════════════════════════════════════════

const listZones = async (req, res, next) => {
  try {
    const zones = await ZonalOffice.findAll({
      include: [{ association: "states", attributes: ["id", "code", "description"] }],
      order: [["zonal_code", "ASC"]],
    });
    res.json({ success: true, data: zones });
  } catch (err) { next(err); }
};

const createZone = async (req, res, next) => {
  try {
    const { zonal_code, description } = req.body;
    if (!zonal_code || !description) {
      return res.status(400).json({ success: false, message: "zonal_code and description required" });
    }
    const zone = await ZonalOffice.create({ zonal_code, description });
    res.status(201).json({ success: true, data: zone });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ success: false, message: "zonal_code already exists" });
    }
    next(err);
  }
};

const updateZone = async (req, res, next) => {
  try {
    const zone = await ZonalOffice.findByPk(req.params.id);
    if (!zone) return notFound(res, "Zone");
    await zone.update(req.body);
    res.json({ success: true, data: zone });
  } catch (err) { next(err); }
};

const deleteZone = async (req, res, next) => {
  try {
    const zone = await ZonalOffice.findByPk(req.params.id);
    if (!zone) return notFound(res, "Zone");
    await zone.destroy();
    res.json({ success: true, message: "Zone deleted" });
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════════════════════
// STATE OFFICES
// ═══════════════════════════════════════════════════════════════════════════════

const listStates = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.zone_id) where.zonal_id = req.query.zone_id;
    const states = await StateOffice.findAll({
      where,
      include: [{ association: "zone", attributes: ["id", "zonal_code", "description"] }],
      order: [["code", "ASC"]],
    });
    res.json({ success: true, data: states });
  } catch (err) { next(err); }
};

const createState = async (req, res, next) => {
  try {
    const { code, description, zonal_id } = req.body;
    if (!code || !description || !zonal_id) {
      return res.status(400).json({ success: false, message: "code, description, zonal_id required" });
    }
    const state = await StateOffice.create({ code, description, zonal_id });
    res.status(201).json({ success: true, data: state });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ success: false, message: "State code already exists" });
    }
    next(err);
  }
};

const updateState = async (req, res, next) => {
  try {
    const state = await StateOffice.findByPk(req.params.id);
    if (!state) return notFound(res, "State");
    await state.update(req.body);
    res.json({ success: true, data: state });
  } catch (err) { next(err); }
};

const deleteState = async (req, res, next) => {
  try {
    const state = await StateOffice.findByPk(req.params.id);
    if (!state) return notFound(res, "State");
    await state.destroy();
    res.json({ success: true, message: "State deleted" });
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════════════════════
// DEPARTMENTS
// ═══════════════════════════════════════════════════════════════════════════════

const listDepartments = async (req, res, next) => {
  try {
    const depts = await Department.findAll({
      include: [{ association: "units", attributes: ["id", "unit_code", "name"] }],
      order: [["department_code", "ASC"]],
    });
    res.json({ success: true, data: depts });
  } catch (err) { next(err); }
};

const createDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "name is required" });
    }
    // Auto-generate: DEPT-001, DEPT-002, ...
    const count = await Department.count();
    const department_code = `DEPT-${String(count + 1).padStart(3, "0")}`;
    const dept = await Department.create({ department_code, name, description });
    res.status(201).json({ success: true, data: dept });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ success: false, message: "department_code already exists" });
    }
    next(err);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findByPk(req.params.id);
    if (!dept) return notFound(res, "Department");
    await dept.update(req.body);
    res.json({ success: true, data: dept });
  } catch (err) { next(err); }
};

const deleteDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findByPk(req.params.id);
    if (!dept) return notFound(res, "Department");
    await dept.destroy();
    res.json({ success: true, message: "Department deleted" });
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════════════════════
// UNITS
// ═══════════════════════════════════════════════════════════════════════════════

const listUnits = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.department_id) where.department_id = req.query.department_id;
    const units = await Unit.findAll({
      where,
      include: [{ association: "department", attributes: ["id", "department_code", "name"] }],
      order: [["unit_code", "ASC"]],
    });
    res.json({ success: true, data: units });
  } catch (err) { next(err); }
};

const createUnit = async (req, res, next) => {
  try {
    const { name, description, department_id } = req.body;
    if (!name || !department_id) {
      return res.status(400).json({ success: false, message: "name and department_id required" });
    }
    // Auto-generate: UNIT-001, UNIT-002, ...
    const count = await Unit.count();
    const unit_code = `UNIT-${String(count + 1).padStart(3, "0")}`;
    const unit = await Unit.create({ unit_code, name, description, department_id });
    res.status(201).json({ success: true, data: unit });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ success: false, message: "unit_code already exists" });
    }
    next(err);
  }
};

const updateUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findByPk(req.params.id);
    if (!unit) return notFound(res, "Unit");
    await unit.update(req.body);
    res.json({ success: true, data: unit });
  } catch (err) { next(err); }
};

const deleteUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findByPk(req.params.id);
    if (!unit) return notFound(res, "Unit");
    await unit.destroy();
    res.json({ success: true, message: "Unit deleted" });
  } catch (err) { next(err); }
};

module.exports = {
  listUsers, getUser, createUser, updateUser, deleteUser,
  listZones, createZone, updateZone, deleteZone,
  listStates, createState, updateState, deleteState,
  listDepartments, createDepartment, updateDepartment, deleteDepartment,
  listUnits, createUnit, updateUnit, deleteUnit,
};
