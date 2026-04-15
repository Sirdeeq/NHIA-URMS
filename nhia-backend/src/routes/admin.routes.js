const { Router } = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const {
  listUsers, getUser, createUser, updateUser, deleteUser,
  listZones, createZone, updateZone, deleteZone,
  listStates, createState, updateState, deleteState,
  listDepartments, createDepartment, updateDepartment, deleteDepartment,
  listUnits, createUnit, updateUnit, deleteUnit,
} = require("../controllers/admin.controller");

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize("admin"));

// Users
router.get("/users", listUsers);
router.get("/users/:id", getUser);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Zonal Offices
router.get("/zones", listZones);
router.post("/zones", createZone);
router.put("/zones/:id", updateZone);
router.delete("/zones/:id", deleteZone);

// State Offices
router.get("/states", listStates);
router.post("/states", createState);
router.put("/states/:id", updateState);
router.delete("/states/:id", deleteState);

// Departments
router.get("/departments", listDepartments);
router.post("/departments", createDepartment);
router.put("/departments/:id", updateDepartment);
router.delete("/departments/:id", deleteDepartment);

// Units
router.get("/units", listUnits);
router.post("/units", createUnit);
router.put("/units/:id", updateUnit);
router.delete("/units/:id", deleteUnit);

module.exports = router;
