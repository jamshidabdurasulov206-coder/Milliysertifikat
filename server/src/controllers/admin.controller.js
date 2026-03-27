const jwt = require("jsonwebtoken");

// Hardcoded admin credentials (change for production!)
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123"; // Use a strong password in real projects
const JWT_SECRET = process.env.JWT_SECRET || "admin_jwt_secret";

exports.login = (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: "1d" });
    return res.json({ token });
  }
  return res.status(401).json({ message: "Invalid admin credentials" });
};
