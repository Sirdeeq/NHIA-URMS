const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Department = sequelize.define(
  "Department",
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    department_code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    state_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: "state_offices", key: "id" },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
  },
  { tableName: "departments", modelName: "Department" }
);

module.exports = Department;
