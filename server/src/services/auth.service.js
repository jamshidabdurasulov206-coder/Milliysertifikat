const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db"); 

exports.register = async (userData) => {
  // Frontenddan 'username' yoki 'name' kelishiga qarab moslashtiramiz
  const { username, name, email, password } = userData;
  const finalUsername = username || name; 

  // 1. Foydalanuvchi borligini tekshirish
  const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  
  if (existingUser.rows.length > 0) {
    throw new Error("User already exists");
  }

  // 2. Parolni hashlash
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Bazaga yozish
  const newUser = await pool.query(
    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
    [finalUsername, email, hashedPassword]
  );

  return newUser.rows[0];
};

exports.login = async ({ email, password }) => {
  // 1. Bazadan qidirish
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  const user = result.rows[0];

  if (!user) {
    throw new Error("User not found");
  }

  // 2. Parolni solishtirish
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid password");
  }

  // 3. Token yaratish
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  return { 
    token, 
    user: { id: user.id, username: user.username, role: user.role } 
  };
};