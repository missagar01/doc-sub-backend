import loginPool from "../config/logindb.js";

// Get all users with access settings
export async function getAllUsers(req, res) {
    try {
        const result = await loginPool.query(
            `SELECT id, user_name, email_id, role, department, subscription_access_system, status 
       FROM users 
       ORDER BY user_name`
        );

        // Parse the subscription_access_system for each user
        const users = result.rows.map(user => {
            let accessSettings = { systems: [], pages: [] };
            if (user.subscription_access_system) {
                try {
                    accessSettings = typeof user.subscription_access_system === 'object'
                        ? user.subscription_access_system
                        : JSON.parse(user.subscription_access_system);
                } catch (e) {
                    // Keep defaults
                }
            }
            return {
                ...user,
                systemAccess: accessSettings.systems || [],
                pageAccess: accessSettings.pages || []
            };
        });

        res.json({ users });
    } catch (err) {
        console.error("Get Users Error:", err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
}

// Update user access settings
export async function updateUserAccess(req, res) {
    try {
        const { id } = req.params;
        const { systems, pages } = req.body;

        // Store as JSON in subscription_access_system column
        // Format: { "systems": ["subscription", "document", "payment"], "pages": ["/app", "/app/add"] }
        const accessJson = JSON.stringify({
            systems: Array.isArray(systems) ? systems : [],
            pages: Array.isArray(pages) ? pages : []
        });

        const result = await loginPool.query(
            `UPDATE users SET subscription_access_system = $1 WHERE id = $2 RETURNING id, user_name, subscription_access_system`,
            [accessJson, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        console.error("Update User Access Error:", err);
        res.status(500).json({ error: "Failed to update user access" });
    }
}

// Get single user access settings
export async function getUserAccess(req, res) {
    try {
        const { id } = req.params;
        const result = await loginPool.query(
            `SELECT id, user_name, email_id, role, department, subscription_access_system FROM users WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = result.rows[0];
        let accessSettings = { systems: [], pages: [] };
        if (user.subscription_access_system) {
            try {
                accessSettings = typeof user.subscription_access_system === 'object'
                    ? user.subscription_access_system
                    : JSON.parse(user.subscription_access_system);
            } catch (e) {
                // Keep defaults
            }
        }

        res.json({
            user: {
                ...user,
                systemAccess: accessSettings.systems || [],
                pageAccess: accessSettings.pages || []
            }
        });
    } catch (err) {
        console.error("Get User Access Error:", err);
        res.status(500).json({ error: "Failed to fetch user access" });
    }
}

