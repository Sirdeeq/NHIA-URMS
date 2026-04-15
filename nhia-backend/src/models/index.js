const AnnualReport = require("./AnnualReport");
const QuarterlyData = require("./QuarterlyData");
const ZonalOffice = require("./ZonalOffice");
const StateOffice = require("./StateOffice");
const Department = require("./Department");
const Unit = require("./Unit");
const { User } = require("./User");

// ── Admin associations ────────────────────────────────────────────────────────
ZonalOffice.hasMany(StateOffice, { foreignKey: "zonal_id", as: "states" });
StateOffice.belongsTo(ZonalOffice, { foreignKey: "zonal_id", as: "zone" });

StateOffice.hasMany(Department, { foreignKey: "state_id", as: "departments" });
Department.belongsTo(StateOffice, { foreignKey: "state_id", as: "state" });

Department.hasMany(Unit, { foreignKey: "department_id", as: "units" });
Unit.belongsTo(Department, { foreignKey: "department_id", as: "department" });

User.belongsTo(ZonalOffice, { foreignKey: "zone_id", as: "zone" });
User.belongsTo(StateOffice, { foreignKey: "state_id", as: "state" });
ZonalOffice.hasMany(User, { foreignKey: "zone_id", as: "users" });
StateOffice.hasMany(User, { foreignKey: "state_id", as: "users" });

module.exports = { AnnualReport, QuarterlyData, ZonalOffice, StateOffice, Department, Unit, User };
