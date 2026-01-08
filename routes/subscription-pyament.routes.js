// routes/subscription-payment.routes.js
import express from "express";
import pool from "../config/db.js";

const router = express.Router();

/* ---------------------------------------------------
   1️⃣ GET Pending Payments
---------------------------------------------------- */

router.get("/pending", async (req, res) => {
  try {
    const query = `
      SELECT *
      FROM subscription
      WHERE actual_3 IS NULL
        AND planned_3 IS NOT NULL
      ORDER BY id DESC;
    `;

    const result = await pool.query(query);
    res.json(result.rows);

  } catch (err) {
    console.error("❌ Error loading pending payments:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ---------------------------------------------------
   2️⃣ GET Payment History
---------------------------------------------------- */

router.get("/history", async (req, res) => {
  try {
    const query = `
      SELECT ph.*, s.subscriber_name
      FROM payment_history ph
      LEFT JOIN subscription s ON ph.subscription_no = s.subscription_no
      ORDER BY ph.id DESC;
    `;

    const result = await pool.query(query);
    res.json(result.rows);

  } catch (err) {
    console.error("❌ Error loading payment history:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ---------------------------------------------------
   3️⃣ POST Payment Submission
---------------------------------------------------- */

router.post("/submit", async (req, res) => {
  try {
    const {
      subscriptionNo,
      paymentMethod,
      transactionId,
      price,
      startDate,
      endDate,
      planned_1,
      insuranceDocument
    } = req.body;

    // 1️⃣ Get current subscription row
    const findQuery = `
      SELECT *
      FROM subscription
      WHERE subscription_no = $1
      LIMIT 1;
    `;

    const existing = await pool.query(findQuery, [subscriptionNo]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const current = existing.rows[0];

    // 2️⃣ Update subscription → price, actual_3, start_date, end_date
    const updateQuery = `
      UPDATE subscription
      SET
        price = $1,
        actual_3 = NOW(),
        actual_1 = NULL,
        start_date = $2,
        end_date = $3,
        planned_1 = $3,
        updated_at = NOW()
      WHERE subscription_no = $4;
    `;

    await pool.query(updateQuery, [
      price,
      startDate,
      endDate,
      subscriptionNo
    ]);

    // 3️⃣ Insert into PAYMENT_HISTORY
    const insertPayment = `
      INSERT INTO payment_history (
        subscription_no,
        payment_mode,
        transaction_id,
        start_date,
        insurance_document
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    await pool.query(insertPayment, [
      subscriptionNo,
      paymentMethod,
      transactionId,
      startDate,
      insuranceDocument
    ]);

    res.json({ success: true, message: "Payment recorded successfully" });

  } catch (err) {
    console.error("❌ Error submitting payment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
