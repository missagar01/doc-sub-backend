import loginPool from "../config/logindb.js";
import jwt from "jsonwebtoken";

export async function loginService(username, password) {
  // Query the checklist-delegation database users table
  const result = await loginPool.query(
    `SELECT id, user_name, password, email_id, role, department, subscription_access_system FROM users WHERE user_name = $1`,
    [username]
  );

  if (result.rows.length === 0) return null;

  const user = result.rows[0];

  // Compare password
  if (password !== user.password) return null;

  // Parse access settings from subscription_access_system column (JSON format)
  // Format: { "systems": ["subscription", "document", "payment"], "pages": ["/app", "/app/add"] }
  let accessSettings = { systems: ["subscription", "document", "payment"], pages: [] };

  if (user.subscription_access_system) {
    try {
      // If it's already an object (JSONB column), use directly
      if (typeof user.subscription_access_system === 'object') {
        accessSettings = user.subscription_access_system;
      } else {
        // If it's a string, parse it
        accessSettings = JSON.parse(user.subscription_access_system);
      }
    } catch (e) {
      // If parsing fails, keep defaults
      console.log("Failed to parse subscription_access_system, using defaults");
    }
  }

  const systemAccess = accessSettings.systems || ["subscription", "document", "payment"];
  const pageAccess = accessSettings.pages || [];

  // create JWT token
  const token = jwt.sign(
    {
      id: user.id,
      username: user.user_name,
      role: user.role || "employee",
      name: user.user_name,
      systemAccess,
      pageAccess,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.user_name,
      name: user.user_name,
      role: user.role || "employee",
      email: user.email_id,
      department: user.department,
      systemAccess,
      pageAccess,
    },
  };
}

