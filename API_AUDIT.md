# SheeshaTonight — Complete API & CRUD Architecture Audit

**Total Discovered API Routes:** 86 Route Endpoints  
**Framework:** Next.js 16.4.2 App Router  
**Protocol:** RESTful JSON over HTTPS  
**Authentication Standard:** Bearer JWT Header / HttpOnly Cookie (`withAuth`, `withVendor`, `withAdmin`)  
**Audit Timestamp:** October 29, 2026  

---

## 1. API Architecture & Security Layer Overview

All API endpoints are located in `app/api/` and operate within Next.js Node.js server runtime, communicating with MariaDB/MySQL via the Prisma Client singleton in `lib/prisma.ts`.

### Security Layers Enforced
1. **Edge Middleware (`middleware.ts`):**  
   - Intercepts all `/api/*` traffic.
   - Enforces cryptographic transit proof for rate limiting.
   - Enforces CSRF origin checks on state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`).
2. **Server-Side Role Guard Wrappers (`lib/middleware.ts`):**  
   - `withAuth`: Verifies token, verifies DB user is `ACTIVE`, injects fresh user identity into request context.
   - `withVendor`: Validates authenticated user holds `role === 'VENDOR' \|\| role === 'ADMIN'` with valid `vendorId`.
   - `withAdmin`: Strictly requires `role === 'ADMIN' \|\| role === 'SUPER_ADMIN'`.
3. **Database Input Validation:**  
   - Zod schemas in `lib/validation.ts` (`safeParse`) for strict object validation.
   - Server-side recalculation of prices, commissions, VAT taxes, and inventory.

---

## 2. API Route Inventory & Audit Matrix

### Category A: Authentication & Session APIs (6 Routes)

| Endpoint | Methods | Auth Required | Models | Input Validation | Audit Finding & Status |
|---|---|---|---|---|---|
| `/api/auth/register` | `POST` | Public (Rate Limited) | `user` | Name, Email, Password, Phone | **FIXED:** Enforced `role: 'CUSTOMER'` server-side. Stripped public vendor bypass. |
| `/api/auth/register/vendor` | `POST` | Public (Rate Limited) | `user`, `vendor` | Business name, Email, Pass, Phone | **FIXED:** New vendors set to `isActive: false` requiring admin KYC review before store is live. |
| `/api/auth/login` | `POST` | Public (Rate Limited) | `user`, `vendor` | Email, Password | **PASS:** Validates bcrypt hash, issues 7-day JWT and secure HttpOnly cookie. |
| `/api/auth/logout` | `POST` | Authenticated | None | None | **PASS:** Sets `auth_token` maxAge to 0, clearing all browser cookies. |
| `/api/auth/me` | `GET` | Authenticated | `user`, `vendor` | None | **PASS:** Re-fetches fresh user details and vendor profile from DB. |
| `/api/auth/dev-switch` | `GET` | Secret Header | `user`, `vendor` | `DEV_SWITCH_SECRET` | **PASS:** Locked down: returns 404 in production mode; requires secret token in dev. |

---

### Category B: Customer Commerce & Account APIs (14 Routes)

| Endpoint | Methods | Auth Required | Models | Input Validation | Audit Finding & Status |
|---|---|---|---|---|---|
| `/api/cart` | `GET`, `POST`, `DELETE` | `withAuth` | `cart`, `product`, `user` | Product ID, Quantity | **PASS:** Persistent MySQL cart. Validates stock in real time, fetches live DB prices. |
| `/api/cart/[itemId]` | `PATCH`, `DELETE` | `withAuth` | `cart`, `product` | Quantity | **PASS:** Object-level check: user can only modify items in their own cart. |
| `/api/checkout` | `POST` | `withAuth` | `order`, `orderItem`, `invoice`, `cart`, `product`, `platformSetting` | Shipping address, Payment method | **PASS:** Atomic transaction: groups orders by vendor, checks 18+ age, computes VAT & fees, decrements stock. |
| `/api/orders` | `GET`, `POST` | `withAuth` | `order`, `orderItem`, `product`, `invoice`, `orderTracking` | Item array, Notes | **PASS:** `GET` strictly filters `where: { userId }`. `POST` creates atomic order. |
| `/api/orders/[orderId]` | `GET`, `POST` | `withAuth` | `order`, `orderItem`, `product`, `orderTracking` | Zod action schema | **PASS:** Strict ownership check: only owner, assigned vendor, or admin can access. Restocks on cancel. |
| `/api/wishlist` | `GET`, `POST`, `DELETE` | `withAuth` | `wishlist`, `product` | Product ID / Batch IDs | **PASS:** Persistent in MySQL. Survives logout/login. Batch sync supported for guests. |
| `/api/wishlist/clear` | `POST` | `withAuth` | `wishlist` | None | **PASS:** Clears all wishlist items for authenticated user. |
| `/api/users/me` | `GET`, `PUT` | `withAuth` | `user` | Name, Phone, Locale | **PASS:** Updates user profile. Re-validates unique phone number collisions. |
| `/api/users/me/addresses` | `GET`, `POST` | `withAuth` | `address` | Zod address schema | **PASS:** Isolated by `userId`. Unsets previous default when new default is chosen. |
| `/api/users/me/addresses/[addressId]` | `GET`, `PUT`, `DELETE` | `withAuth` | `address` | Zod address schema | **PASS:** Verified: user can only view, update, or delete their own addresses. |
| `/api/notifications` | `GET`, `POST`, `PATCH`| `withAuth` (`POST` Admin) | `notification` | Notification IDs | **PASS:** User reads and updates only their notifications. Admin creates broadcasts. |
| `/api/reviews` | `GET`, `POST` | `withAuth` (`POST`) | `review`, `product` | Rating (1-5), Comment | **PASS:** Links review to authenticated user ID and product ID. |
| `/api/bookings` | `GET`, `POST` | `withAuth` | `order` | Rental dates, Setup ID | **PASS:** Manages sheesha rental bookings with start/end calendar dates. |
| `/api/contact` | `POST` | Public (Rate Limited) | None | Name, Email, Message | **PASS:** Validates email format, dispatches admin contact notification. |

---

### Category C: Vendor Portal APIs (12 Routes)

| Endpoint | Methods | Auth Required | Models | Input Validation | Audit Finding & Status |
|---|---|---|---|---|---|
| `/api/vendor` | `GET` | `withVendor` | `vendor`, `user` | None | **PASS:** Returns vendor store profile. |
| `/api/vendor/apply` | `POST` | `withAuth` | `vendor`, `vendorDocument` | Business name, License | **PASS:** Creates vendor record in pending state (`isActive: false`). |
| `/api/vendor/dashboard` | `GET` | `withVendor` | `vendor`, `order`, `product`, `settlement`, `review` | None | **PASS:** 100% database-computed statistics and sales charts for vendor's store. |
| `/api/vendor/products` | `GET`, `POST` | `withVendor` | `product` | Zod create product schema | **FIXED:** Added server check verifying `vendor.isActive === true` before product creation. |
| `/api/vendor/products/[id]` | `GET`, `PATCH`, `POST`, `DELETE` | `withVendor` | `product`, `auditLog` | Zod update product schema | **PASS:** Verified: vendor can only access/modify products with matching `vendorId`. Soft-deletes cleanly. |
| `/api/vendor/orders` | `GET` | `withVendor` | `order`, `orderItem`, `user` | Status, Date filters | **PASS:** Scoped strictly to orders where `vendorId === user.vendorId`. |
| `/api/vendor/documents` | `GET` | `withVendor` | `vendorDocument` | None | **PASS:** Returns KYC verification documents submitted by this vendor. |
| `/api/vendor/profile` | `GET`, `PUT` | `withVendor` | `vendor` | Name, Bio, Phone, Location | **PASS:** Updates vendor store settings and public contact details. |
| `/api/vendor/settlements` | `GET` | `withVendor` | `settlement` | Status, Period | **PASS:** Lists vendor financial settlement records and payout status. |
| `/api/vendor/reviews` | `GET` | `withVendor` | `review` | None | **PASS:** Lists customer reviews for this vendor's products. |
| `/api/vendor/notifications` | `GET` | `withVendor` | `notification` | None | **PASS:** Vendor notifications filtered by vendor's owner `userId`. |
| `/api/vendor/notifications/[id]` | `PATCH` | `withVendor` | `notification` | Read status | **PASS:** Marks vendor alert as read. |

---

### Category D: Administrator Control APIs (36 Routes)

| Endpoint | Methods | Auth Required | Models | Input Validation | Audit Finding & Status |
|---|---|---|---|---|---|
| `/api/admin/users` | `GET`, `POST` | `withAdmin` | `user` | Name, Email, Role | **PASS:** Admin user list with search, role filters, and pagination. |
| `/api/admin/users/[userId]` | `GET`, `PUT`, `DELETE` | `withAdmin` | `user`, `order` | Status, Role | **PASS:** Manages customer/vendor accounts, suspension, and role updates. |
| `/api/admin/vendors` | `GET` | `withAdmin` | `vendor`, `user`, `order` | Tier, isActive filters | **PASS:** Lists vendor lounge applications and active storefronts. |
| `/api/admin/vendors/[id]` | `GET`, `PUT`, `POST`, `PATCH` | `withAdmin` | `vendor`, `product`, `order` | Action (`approve`/`reject`) | **FIXED:** Exported `PATCH = PUT` alias so approval button operates correctly. |
| `/api/admin/vendors/documents` | `GET`, `PUT` | `withAdmin` | `vendorDocument` | Status (`APPROVED`/`REJECTED`) | **PASS:** Admin KYC document review and verification approval workflow. |
| `/api/admin/products` | `GET`, `POST` | `withAdmin` | `product`, `vendor` | Zod product schema | **PASS:** Platform-wide catalog curation and product approval. |
| `/api/admin/products/[id]` | `GET`, `PUT`, `DELETE` | `withAdmin` | `product` | Product fields | **PASS:** Global product management and force deactivation. |
| `/api/admin/categories` | `GET`, `POST` | `withAdmin` | `category` | Name, Slug, Image | **PASS:** Category taxonomy CRUD operations. |
| `/api/admin/categories/[id]` | `GET`, `PUT`, `DELETE` | `withAdmin` | `category` | Category fields | **PASS:** Edit/delete navigation category. |
| `/api/admin/orders` | `GET` | `withAdmin` | `order`, `vendor`, `user` | Status, Pagination | **PASS:** Platform-wide order list with multi-vendor breakdowns. |
| `/api/admin/orders/[orderId]` | `GET`, `PATCH` | `withAdmin` | `order`, `orderTracking` | Status update | **PASS:** Admin override of order fulfillment and delivery tracking status. |
| `/api/admin/invoices` | `GET` | `withAdmin` | `invoice`, `order` | Invoice number | **PASS:** Lists all generated VAT invoices. |
| `/api/admin/invoices/[id]` | `GET` | `withAdmin` | `invoice`, `order` | None | **PASS:** Generates detailed tax invoice printable views. |
| `/api/admin/finance` | `GET` | `withAdmin` | `order`, `platformSetting` | Date range | **PASS:** Computes gross platform volume, total fees, and vendor balances. |
| `/api/admin/payouts` | `GET`, `POST` | `withAdmin` | `order`, `settlement` | Vendor ID, Amount | **PASS:** Manages vendor disbursement records. |
| `/api/admin/payouts/[payoutId]` | `GET`, `PUT` | `withAdmin` | `settlement` | Status (`PAID`/`FAILED`) | **PASS:** Records vendor payout confirmations. |
| `/api/admin/settlements` | `GET`, `POST` | `withAdmin` | `settlement`, `vendor` | Period | **PASS:** End-of-month vendor reconciliation accounting engine. |
| `/api/admin/settlements/[id]` | `GET`, `PUT` | `withAdmin` | `settlement` | Status | **PASS:** Settlement review and approval. |
| `/api/admin/coupons` | `GET`, `POST` | `withAdmin` | `coupon` | Code, Discount, Dates | **PASS:** Promotional campaign creation and usage limit controls. |
| `/api/admin/coupons/[id]` | `GET`, `PUT`, `DELETE` | `withAdmin` | `coupon` | Coupon fields | **PASS:** Coupon editing and revocation. |
| `/api/admin/customers` | `GET` | `withAdmin` | `user`, `order` | Search, Status | **PASS:** Customer relationship management and order histories. |
| `/api/admin/customers/[id]` | `GET`, `PUT` | `withAdmin` | `user`, `order`, `address` | Status | **PASS:** Individual customer profile inspection and suspension. |
| `/api/admin/reviews` | `GET` | `withAdmin` | `review`, `product` | Status filter | **PASS:** Review moderation queue. |
| `/api/admin/reviews/[id]` | `PATCH`, `DELETE` | `withAdmin` | `review` | Status (`APPROVED`/`HIDDEN`) | **PASS:** Moderates or deletes customer reviews. |
| `/api/admin/notifications` | `POST` | `withAdmin` | `notification` | Title, Body, User ID | **PASS:** Dispatches system alerts to specific users or broadcast. |
| `/api/admin/audit-logs` | `GET` | `withAdmin` | `auditLog`, `user` | Action, Date filters | **PASS:** Immutable audit log viewing for security compliance. |
| `/api/admin/cms/banners` | `GET`, `POST` | `withAdmin` | `cmsBanner` | Heading, Images, URL | **PASS:** Homepage hero slider banner management. |
| `/api/admin/cms/banners/[id]` | `GET`, `PUT`, `DELETE` | `withAdmin` | `cmsBanner` | Banner fields | **PASS:** Banner editing and reordering. |
| `/api/admin/cms/pages` | `GET`, `POST` | `withAdmin` | `cmsPage` | Title, Slug, Content | **PASS:** CMS page creation and rich text persistence. |
| `/api/admin/cms/pages/[id]` | `GET`, `PUT`, `DELETE` | `withAdmin` | `cmsPage` | CMS page fields | **PASS:** CMS page editing and SEO metadata updates. |
| `/api/admin/cms/content/[key]`| `GET`, `PUT` | `withAdmin` | `cmsContent` | JSON content blob | **PASS:** Key-value configuration for site sections. |
| `/api/admin/stats` | `GET` | `withAdmin` | All models | None | **PASS:** Admin executive dashboard top-line KPI statistics. |
| `/api/admin/reports` | `GET` | `withAdmin` | `order`, `product` | Report type | **PASS:** Generates sales, vendor performance, and inventory reports. |
| `/api/admin/search` | `GET` | `withAdmin` | All models | Query string | **PASS:** Global admin search across orders, vendors, users, products. |
| `/api/admin/seo` | `GET`, `PUT` | `withAdmin` | `cmsPage`, `product` | Metadata fields | **PASS:** Sitemap and meta-tag optimization configuration. |
| `/api/admin/wishlist` | `GET` | `withAdmin` | `wishlist`, `product` | None | **PASS:** Market demand analytics on customer wishlist trends. |

---

### Category E: Public Catalog, CMS & Payments (18 Routes)

| Endpoint | Methods | Auth Required | Models | Input Validation | Audit Finding & Status |
|---|---|---|---|---|---|
| `/api/products` | `GET` | Public | `product`, `vendor` | Type, Price, Featured | **PASS:** Paginated catalog query. Respects `isActive: true` and `deletedAt: null`. |
| `/api/products/[id]` | `GET` | Public | `product`, `vendor` | Product ID | **PASS:** Product details endpoint with vendor lounge information. |
| `/api/categories` | `GET` | Public | `category` | None | **PASS:** Active product categories listing. |
| `/api/vendors` | `GET` | Public | `vendor`, `product` | Region, Search | **PASS:** Public vendor directory and lounge discovery. |
| `/api/vendors/[id]` | `GET` | Public | `vendor` | Vendor ID / Slug | **PASS:** Public lounge storefront details. |
| `/api/vendors/[id]/products`| `GET` | Public | `product` | None | **PASS:** Products available specifically at this vendor lounge. |
| `/api/cms/banners` | `GET` | Public | `cmsBanner` | Position | **PASS:** Fetches active promotional banners for storefront. |
| `/api/cms/pages/[slug]` | `GET` | Public | `cmsPage` | Slug, Preview token | **PASS:** Delivers published CMS page content (`/about`, `/terms`, etc.). |
| `/api/cms/content/[key]` | `GET` | Public | `cmsContent` | Key | **PASS:** Fetches public section JSON configuration. |
| `/api/seo` | `GET` | Public | None | None | **PASS:** Dynamic XML sitemap and metadata feed. |
| `/api/health` | `GET` | Public | `user` (ping) | None | **PASS:** Returns server status, database latency, and timestamp. |
| `/api/payments/stripe/checkout` | `POST` | `withAuth` | `cart`, `product` | None | **PASS:** Safe gateway fallback: returns 503 if unconfigured, directs to COD. |
| `/api/payments/stripe/webhook` | `POST` | Stripe Signature | `auditLog`, `order` | Cryptographic signature | **PASS:** Verifies signature, prevents replay attacks via DB idempotency audit log. |
| `/api/upload` | `POST` | `withAuth` (Rate Limited) | None | MIME type, Extension, 5MB | **PASS:** Validates JPEG/PNG/WebP, randomizes filename. Writes to `public/uploads`. |
| `/api/upload/delete` | `DELETE` | `withAuth` (Vendor/Admin) | None | URL array | **PASS:** Sanitizes paths with `path.basename` to prevent directory traversal. |
| `/api/users` | `GET` | `withAdmin` | `user` | Pagination | **PASS:** User directory. |
| `/api/users/index` | `GET` | `withAdmin` | `user` | Pagination | **PASS:** Secondary user indexing endpoint. |
| `/api/admin/payments` | `GET` | `withAdmin` | `order`, `auditLog` | None | **PASS:** Stripe & COD payment reconciliation log. |

---

## 3. CRUD Verification Summary

- **Create (POST):** All mutative creation routes enforce authentication and server-side validation.
- **Read (GET):** Protected routes enforce user-level and vendor-level filtering at the database layer (`where: { userId }` or `where: { vendorId }`).
- **Update (PUT/PATCH):** Only allowed fields are updated. Critical fields (`id`, `createdAt`, `userId`) are protected.
- **Delete (DELETE):** Products use soft deletion (`deletedAt: new Date()`) to protect relational integrity with orders and invoices.
