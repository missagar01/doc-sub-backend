import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pg;

// Login database connection (checklist-delegation)
// Uses same host/user/password/port but different database name
const loginPool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.CHECKLIST_DB_NAME, // checklist-delegation database
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }, // required for AWS RDS
});

loginPool
    .connect()
    .then(() => console.log("✅ Connected to Checklist DB (Login)"))
    .catch((err) => console.error("❌ Checklist DB connection error:", err.message));

export default loginPool;
