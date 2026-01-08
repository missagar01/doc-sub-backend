import pool from "../config/db.js";

/* ---------------- FETCH PENDING RENEWAL ---------------- */
export async function fetchPendingRenewals() {
    const query = `
        SELECT 
            id,
            subscription_no,
            company_name,
            subscriber_name,
            subscription_name,
            price,
            frequency,
            end_date,
            planned_1
        FROM subscription
        WHERE planned_1 IS NOT NULL
          AND actual_1 IS NULL
    `;
    const result = await pool.query(query);
    return result.rows;
}

/* ---------------- FETCH RENEWAL HISTORY ---------------- */
export async function fetchRenewalHistory() {
    const query = `
        SELECT sr.*, s.subscriber_name
        FROM subscription_renewals sr
        LEFT JOIN subscription s ON sr.subscription_no = s.subscription_no
        ORDER BY sr.timestamp DESC
    `;
    const result = await pool.query(query);
    return result.rows;
}

/* ---------------- INSERT RENEWAL ---------------- */
export async function insertRenewal(data) {
    const query = `
        INSERT INTO subscription_renewals
            (renewal_no, subscription_no, renewal_status, approved_by, price)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
    const values = [
        data.renewal_no,
        data.subscription_no,
        data.renewal_status,
        data.approved_by,
        data.price
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
}

/* ---------------- UPDATE SUBSCRIPTION ---------------- */
export async function updateSubscriptionForRenewal(data) {
    const query = `
        UPDATE subscription
        SET 
            actual_1 = $1,
            actual_2 = NULL,
            renewal_count = renewal_count + 1,
            renewal_status = $2,
            price = $4
        WHERE subscription_no = $3
    `;

    const values = [data.actual_1, data.renewal_status, data.subscription_no, data.price];

    await pool.query(query, values);
}
