const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { JWT_SECRET } = require("../middleware/auth");

/** POST /api/auth/login */
const login = async (req, res, next) => {
  try {
    const { staff_id, password } = req.body;
    if (!staff_id || !password) {
      return res.status(400).json({ success: false, message: "staff_id and password required" });
    }

    const user = await User.findOne({
      where: { staff_id },
      include: [
        { association: "zone",       attributes: ["id", "zonal_code", "description"] },
        { association: "state",      attributes: ["id", "code", "description"] },
        { association: "department", attributes: ["id", "name", "department_code"] },
        { association: "unit",       attributes: ["id", "name", "unit_code"] },
      ],
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "8h" });

    const { password: _pw, ...userData } = user.toJSON();

    // Parse functionalities JSON string → array if needed
    if (typeof userData.functionalities === "string") {
      try { userData.functionalities = JSON.parse(userData.functionalities); }
      catch { userData.functionalities = []; }
    }
    if (!Array.isArray(userData.functionalities)) userData.functionalities = [];

    res.json({ success: true, token, user: userData });
  } catch (err) {
    next(err);
  }
};

/** GET /api/auth/me */
const me = async (req, res) => {
  const userData = req.user.toJSON ? req.user.toJSON() : { ...req.user };
  delete userData.password;
  // Parse functionalities JSON string → array if needed
  if (typeof userData.functionalities === "string") {
    try { userData.functionalities = JSON.parse(userData.functionalities); }
    catch { userData.functionalities = []; }
  }
  if (!Array.isArray(userData.functionalities)) userData.functionalities = [];
  res.json({ success: true, user: userData });
};

module.exports = { login, me };
