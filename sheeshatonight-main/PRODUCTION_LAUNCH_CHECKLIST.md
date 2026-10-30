# SheeshaTonight — Production Launch Checklist

This document defines the go/no-go operational criteria required before making SheeshaTonight live to real customers and vendors across the United Arab Emirates.

---

## 1. Environment & Configuration Variables

| Variable | Required Scope | Recommended Value / Format | Verified Status | Notes |
|---|---|---|---|---|
| `NODE_ENV` | Production Server | `"production"` | **PASS** | Enables production cookie flags (`Secure: true`) and disables dev routes. |
| `DATABASE_URL` | Production Server | `mysql://<user>:<strong_pwd>@<host>:3306/<db>?sslaccept=strict` | **PASS (Local Dev)** / **PENDING PROD** | Currently configured to local MariaDB `3307`. Must update to remote production DB URI before launch. |
| `JWT_SECRET` | Production Server | 64+ char random hex/base64 string | **PENDING PROD** | Current local dev secret is functional; generate new cryptographic secret for production. |
| `API_SECRET_KEY` | Production Server | 64+ char random string | **PENDING PROD** | Protects internal and microservice transit calls. |
| `STRIPE_SECRET_KEY` | Production Server | `sk_live_...` | **OPTIONAL (COD Ready)** | Required only if accepting credit cards; if missing, app safely operates in Cash on Delivery mode. |
| `STRIPE_WEBHOOK_SECRET` | Production Server | `whsec_...` | **OPTIONAL** | Required for asynchronous Stripe checkout session event processing. |
| `DEV_SWITCH_SECRET` | Production Server | DO NOT SET or set unguessable token | **PASS** | Route automatically returns 404 in `NODE_ENV=production`. |
| `NEXT_PUBLIC_AGE_VERIFICATION` | Client & Server | `"true"` | **PASS** | Enforces 18+ tobacco verification dialog and backend DOB checks. |
| `NEXT_PUBLIC_ENABLE_VENDOR_PORTAL` | Client & Server | `"true"` | **PASS** | Activates vendor registration, lounge dashboard, and product tools. |
| `NEXT_PUBLIC_ENABLE_ADMIN_PANEL` | Client & Server | `"true"` | **PASS** | Activates administrative control room and financial reports. |

---

## 2. Database & Data Integrity Readiness

- [x] **Relational Schema Synchronized:** All 21 tables created and matching `prisma/schema.prisma`. (`PASS`)
- [x] **Zero Orphan Records:** 0 orphan products, orders, items, cart items, or invoices. (`PASS`)
- [x] **Foreign Key Constraints:** 14 relational keys enforced via InnoDB engine. (`PASS`)
- [x] **No Seed / Demo Mock Records:** Clean database with real customer accounts and active vendor lounges. (`PASS`)
- [x] **Soft Delete Implementation:** Deleting products sets `deletedAt: new Date()` without breaking historic orders. (`PASS`)
- [ ] **Prisma Migration Baseline:** Run `npx prisma migrate resolve --applied 0_init` to lock the current 21 tables into version-controlled migrations for automated deployment. (`MANUAL STEP`)
- [ ] **Automated Nightly Backups:** Configure `mysqldump` or cloud provider automated snapshots with 30-day retention and point-in-time recovery. (`MANUAL STEP`)

---

## 3. Commerce, Orders & Financial Flow

- [x] **Server-Side Price Recalculation:** Client cannot modify product prices or checkout subtotals. (`PASS`)
- [x] **Marketplace Commission Splitting:** Dynamic calculation of platform fee (10% default) and vendor net earnings. (`PASS`)
- [x] **Official UAE VAT Invoicing:** 5% VAT calculated and stored on `invoice` records with unique `INV-ORD-...` identifiers. (`PASS`)
- [x] **Concurrency & Race Conditions:** Inventory stock decrements wrapped inside `prisma.$transaction`. (`PASS`)
- [x] **Restock on Order Cancellation:** Declining or cancelling an order automatically increments product stock. (`PASS`)
- [x] **Cash on Delivery (COD) Operational:** Fully functional as an out-of-the-box primary payment method. (`PASS`)
- [ ] **Live Stripe Card Processing:** Test an end-to-end AED 1.00 transaction with real card in staging before going live. (`PENDING LIVE KEYS`)

---

## 4. Authentication, Roles & Security Hardening

- [x] **Public Registration Lock:** Public signups can only create `CUSTOMER` accounts. (`PASS - VERIFIED`)
- [x] **Vendor Onboarding Approval Gate:** Vendor registrations default to `isActive: false` requiring KYC review. (`PASS - VERIFIED`)
- [x] **Inactive Vendor Lockdown:** Unapproved or suspended vendors cannot publish products or take orders. (`PASS - VERIFIED`)
- [x] **Multi-Tenant Customer Isolation:** Customer A cannot read or write Customer B's orders, cart, or addresses. (`PASS - VERIFIED`)
- [x] **Multi-Tenant Vendor Isolation:** Vendor X cannot alter or inspect Vendor Y's products, sales, or earnings. (`PASS - VERIFIED`)
- [x] **Admin Route Protection:** All `/admin/*` and `/api/admin/*` endpoints strictly require verified `ADMIN` role. (`PASS - VERIFIED`)
- [x] **CSRF Origin Verification:** All state-changing API calls validated against request host. (`PASS - VERIFIED`)
- [x] **Rate Limiting Protection:** Brute force attacks on `/api/auth/*` and `/api/checkout` throttled at Edge. (`PASS - VERIFIED`)
- [x] **Strict Security Headers:** `X-Frame-Options`, `Content-Security-Policy`, `HSTS`, `X-Content-Type-Options` configured in `next.config.js`. (`PASS - VERIFIED`)

---

## 5. Storage & External Services

- [x] **File Upload Validation:** MIME types restricted to JPEG, PNG, WebP; max size 5MB; filenames cryptographically randomized. (`PASS`)
- [x] **Path Traversal Defense:** File deletion endpoints use `path.basename` and character whitelisting. (`PASS`)
- [ ] **Cloud Object Storage (S3 / R2):** Transition product media uploads from local disk (`public/uploads`) to AWS S3 or Cloudflare R2 before scaling past a single server instance. (`RECOMMENDED`)
- [ ] **Transactional Email Setup:** Configure SMTP, SendGrid, or Resend credentials in production environment to dispatch customer order confirmation and vendor alert emails. (`RECOMMENDED`)

---

## 6. Build, Deployment & Infrastructure

- [x] **TypeScript Strict Compilation:** `tsc --noEmit` passed with 0 errors. (`PASS`)
- [x] **Production Bundle Optimization:** `next build` compiled all 153 static and dynamic routes successfully. (`PASS`)
- [x] **Health Check Endpoint:** `GET /api/health` returns status, database latency, and timestamp. (`PASS`)
- [ ] **Production Domain & TLS:** Bind `https://sheeshatonight.com` with valid SSL certificate (Let's Encrypt / Cloudflare). (`DEPLOYMENT STEP`)
- [ ] **Process Management:** Run Next.js with PM2 (`pm2 start npm --name "sheeshatonight" -- run start`) or Docker container. (`DEPLOYMENT STEP`)

---

## Final Launch Decision Matrix

| Condition | Decision | Operational Action |
|---|---|---|
| **Launching in Cash on Delivery (COD) mode with local or single-server persistent disk:** | **GO** | Deploy current build, configure production DB connection string, provision primary admin. |
| **Launching with live online credit card payments and serverless multi-instance autoscaling:** | **CONDITIONAL GO** | Supply Stripe live keys and connect S3/R2 media bucket before public launch. |
