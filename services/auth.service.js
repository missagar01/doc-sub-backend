import pool from "../config/db.js";
import jwt from "jsonwebtoken";

export async function loginService(username, password) {
  const result = await pool.query(
    `SELECT * FROM users WHERE username = $1`,
    [username]
  );

  if (result.rows.length === 0) return null;

  const user = result.rows[0];

  if (password !== user.password) return null;

  // update last login
  await pool.query(
    `UPDATE users SET last_login = NOW() WHERE id = $1`,
    [user.id]
  );

  // create JWT token
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    user: {
      username: user.username,
      name: user.name,
      role: user.role,
      email: user.email
    },
  };
}
