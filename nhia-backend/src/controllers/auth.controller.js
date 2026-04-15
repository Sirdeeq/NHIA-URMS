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
        { association: "zone", attributes: ["id", "zonal_code", "description"] },
        { association: "state", attributes: ["id", "code", "description"] },
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
    res.json({ success: true, token, user: userData });
  } catch (err) {
    next(err);
  }
};

/** GET /api/auth/me */
const me = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { login, me };
