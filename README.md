# Subscription System Backend API

## Overview
Express + PostgreSQL APIs powering the subscription workflows and admin dashboards. The backend exposes authentication plus subscription, approval, payment, renewal, dashboard, and user-management endpoints; several routes rely on JWT-based sessions that the frontend (at `http://localhost:5173`) consumes.

## Environment
Copy `backend/.env` from the template below, then populate the real credentials before running:

```
PORT=5050
DB_HOST=...
DB_USER=postgres
DB_PASSWORD=...
DB_NAME=Subscription-System
DB_PORT=5432
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=repair-system-image
JWT_SECRET=vikash@7223820412
```

The AWS keys are used in `middleware/s3Upload.js` when files are stored in S3. Keep `JWT_SECRET` in sync with the frontend so tokens validate correctly.

## Local development

1. `cd backend`
2. `npm install`
3. `npm run start` (nodemon watches `server.js`)

The server will listen on `PORT` (default `5050`) bound to `0.0.0.0`. The root `/` responds with `Repair System API Working 🚀`.

## Authentication flow

- `POST /api/auth/login` accepts `{ username, password }`, validates via bcrypt, refreshes `last_login`, and returns:
  ```json
  {
    "token": "<jwt>",
    "user": {
      "username": "...",
      "name": "...",
      "role": "...",
      "email": "..."
    }
  }
  ```
- The JWT is signed with `JWT_SECRET` and must be supplied for protected endpoints using `Authorization: Bearer <token>`.
- Failed credentials return `400`, token problems return `403`, and server errors return `500`.

## API Reference

### Subscription management

- `POST /api/subscription/create`
  - Auth: open
  - Body: `{ timestamp, subscriptionNo, companyName, subscriberName, subscriptionName, price, frequency, purpose }`
  - Response: `{ success: true, data: <inserted row> }`
- `GET /api/subscription/all`
  - Auth: open
  - Returns every row from `subscription` ordered by `id DESC`.
- `GET /api/subscription/generate-number`
  - Auth: open
  - Response: `{ subscriptionNo: "SUB-####" }` generated from the last stored subscription number.

### Subscription approvals

- `GET /api/subscription-approval/pending`
  - Auth: open
  - Returns subscriptions awaiting manager approval (records with `actual_2 IS NULL` and `planned_2 IS NOT NULL`).
- `GET /api/subscription-approval/history`
  - Auth: open
  - Returns the `approval_history` rows sorted by latest first.
- `POST /api/subscription-approval/submit`
  - Auth: open
  - Body: `{ subscriptionNo, approval, note, approvedBy, requestedOn }`
  - Updates the `subscription` row (`actual_2`, `approval_status`, `updated_at`) and inserts a new row in `approval_history` with an auto-generated `APG-####` number.

### Payment coordination

- `GET /api/subscription-payment/pending`
  - Auth: open
  - Lists subscriptions whose `actual_3 IS NULL` but `planned_3` exists, meaning payment is due.
- `GET /api/subscription-payment/history`
  - Auth: open
  - Streams the `payment_history` table.
- `POST /api/subscription-payment/submit`
  - Auth: open
  - Body: `{ subscriptionNo, paymentMethod, transactionId, price, startDate, endDate, insuranceDocument }`
  - Updates the corresponding `subscription` with new price/dates and adds a `payment_history` entry.

### Renewals

- `GET /api/subscription-renewal/pending`
  - Auth: open
  - Returns subscriptions with `planned_1` set but `actual_1` unset (`planned` renewal awaiting action).
- `GET /api/subscription-renewal/history`
  - Auth: open
  - Returns `subscription_renewals`, newest first.
- `POST /api/subscription-renewal/submit`
  - Auth: open
  - Body: `{ subscription_no, renewal_status, approved_by, price }`
  - Generates a `REN-######` number, marks `actual_1`/`renewal_status` on `subscription`, increments `renewal_count`, and inserts the renewal record.

### Dashboard & subscription views (require JWT)

- All of these routes use `authMiddleware` (JWT from login).
- `GET /api/dashboard-routes/all`: returns every subscription (admin view).
- `GET /api/dashboard-routes/mine`: filters subscriptions by `subscriber_name` from the token.
- `GET /api/dashboard-routes/dashboard`: aggregates the same list but is intended for dashboard stats/responsive UI. The `/dashboards` and `/dashboard-all` paths exist as public shortcuts that return the same data without auth.
- `GET /api/mySubscriptions/`: returns a compact view with `{ subscriptionNo, companyName, startDate, endDate, price, subscriberName, subscriptionName, status }`, where `status` is calculated client-side logic mirrored in `mySubscriptionContorller` (`Expired`, `Active`, `Upcoming`).

### User management (protected)

- `GET /api/users/`: returns `id, username, name, email, role, last_login`.
- `POST /api/users/create`: body `{ username, name, email, password, role }`, hashes the password, and returns the created user metadata.
- `PUT /api/users/update/:username`: updates the specified user; password is rehashed only when it does not already look hashed.
- `DELETE /api/users/delete/:username`: removes the user.

### Support endpoints

- `GET /api/master/`: returns `{ companyName: ["Company A", ...] }` for dropdowns.
- `GET /api/users1/`: returns `{ data: [{ username, name, role }, ...] }` (no auth), used for simple lists or selects.

## Notes

- `config/db.js` exposes a pooled Postgres client; tweak `max` connections or SSL in that file if deploying to production.
- The frontend stores the JWT in `localStorage` and calls `setAuthToken` (from `$lib/api/client.ts`) so axios includes `Authorization` headers automatically.
- Nodemon restarts the server on every `server.js` change; run `npm run start` during development.

