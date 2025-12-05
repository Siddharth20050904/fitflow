# GymPro — Gym Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE) [![Node.js CI](https://img.shields.io/badge/Node.js-v18%2B-brightgreen.svg)]()

A comprehensive, full‑stack gym management application built with modern web technologies. Provides separate portals for **Admins** and **Members** with billing, notifications, a supplement store, and reports.

---

## Demo access

> **Test accounts** (created automatically on first login):
>
> * **Test Admin Login**: `/admin/login` → Click **Login as Test Admin**
> * **Test Member Login**: `/member/login` → Click **Login as Test Member**
>
> Both test accounts use: `testuser@mail.com` (test accounts are created automatically in the database).

---

## Table of Contents

1. [Features](#features)
2. [Routes & Functionality](#routes--functionality)
3. [API Reference](#api-reference)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Database Schema (overview)](#database-schema-overview)
7. [Authentication Flow](#authentication-flow)
8. [Workflows](#workflows)
9. [Environment variables](#environment-variables)
10. [Getting Started](#getting-started)
11. [Production](#production)
12. [Security & Validation](#security--validation)
13. [Future enhancements](#future-enhancements)
14. [License](#license)

---

## Features

### Admin Portal

* Dashboard: total members, revenue, package stats, recent activity
* Member management: add/edit/delete, status management, search & filter
* Billing management: create bills, mark paid, download receipts, overdue tracking
* Package management: create/update/delete packages, view enrollments
* Notifications: send email + in‑app notifications (all/active/with pending bills)
* Store management: add products, manage inventory, handle member orders
* Reports: revenue, membership distribution, payment summary, CSV/XLSX export
* Settings: configure gym business information

### Member Portal

* Dashboard: membership status, package details, dues & due dates
* Bills & receipts: view bills, filter, download receipts
* Notifications: mark read/delete notifications
* Store: browse products (10% member discount), place orders, view order history
* Profile settings: update personal information

---

## Routes & Functionality

### Admin Routes (examples)

* `/admin/login` — Admin login (magic link + test backdoor)
* `/admin/dashboard` — Admin dashboard
* `/admin/members` — Member management UI
* `/admin/billing` — Billing UI
* `/admin/packages` — Package management
* `/admin/notifications` — Notification center
* `/admin/store` — Store & orders
* `/admin/reports` — Reports & export
* `/admin/settings` — Gym settings

### Member Routes (examples)

* `/member/login` — Member login (magic link + backdoor)
* `/member/dashboard` — Member dashboard
* `/member/bills` — Billing & receipts
* `/member/notifications` — Member notifications
* `/member/store` — Member store
* `/member/settings` — Profile settings

### Public Routes

* `/` — Landing page
* `/signin` — Magic link verification

---

## API Reference

> **Note:** The API path prefix used in the project is typically `/api` (Next.js API routes).

### Authentication

* `POST /api/admin/login` — Send admin magic link: `{ email: string }`
* `POST /api/member/login` — Send member magic link: `{ email: string }`
* `GET /api/auth/[...nextauth]` — NextAuth handler (session)

### Admin APIs (examples)

* `GET /api/admin/dashboardData` — Fetch admin dashboard stats
* `POST /api/admin/addMember` — Add a member: `{ name, email, phone, packageId, status }`
* `PUT /api/admin/updateMember` — Update member: `{ id, ... }`
* `DELETE /api/admin/deleteMember` — Delete member: `{ id }`

### Member APIs (examples)

* `GET /api/member/fetchDashboard` — Member dashboard data
* `GET /api/member/fetchMembers` — List members
* `GET /api/member/fetchMemberBills?memberId=&billId=` — Member bills
* `GET|PUT|DELETE /api/member/fetchNotifications` — Manage notifications
* `GET|POST /api/member/store` — Product list / create order
* `GET|PUT /api/member/settings` — Get / update profile
* `GET /api/member/receipt?receiptId=` — Receipt details

### Billing APIs

* `POST /api/billing/createBill` — `{ memberId, amount, dueDate, description }`
* `GET /api/billing/fetchBills?status=&memberId=` — Fetch bills with filters

### Packages

* `GET /api/packages/fetchPackages` — List packages
* `POST /api/packages/createPackage` — Create package
* `PUT /api/packages/updatePackage` — Update package
* `DELETE /api/packages/deletePackage` — Delete package

### Store

* `GET|POST|PUT|DELETE /api/store/products` — Product CRUD
* `GET|PUT /api/store/orders` — Orders management
* `GET /api/store/analytics` — Sales analytics

### Reports

* `GET /api/reports/overviewStats`
* `GET /api/reports/paymentSummary`
* `GET /api/reports/membershipDistribution`
* `GET /api/reports/revenueByPackage`
* `GET /api/reports/monthlyRevenueTrend`
* `POST /api/reports/generateCustomReport` — `{ startDate, endDate, type }`
* `GET /api/reports/exportReportCSV` — Download CSV
* `GET /api/reports/exportReportExcel` — Download XLSX

### Settings

* `GET /api/settings/fetchGymInfo`
* `POST /api/settings/postGymInfo` — Update gym info

### Email

* `POST /api/handleMails/sendLogin` — Send magic link
* `POST /api/handleMails/sendCustomNotification` — Send notification email + create DB record

---

## Tech Stack

**Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui, Lucide React, Recharts

**Backend**: Next.js API routes, Prisma ORM, PostgreSQL, NextAuth.js, Nodemailer, JWT

**Utilities**: react-hot-toast, date-fns, xlsx

---

## Project Structure (top-level)

```
├── app/
│   ├── admin/          # Admin portal pages & UI
│   ├── member/         # Member portal pages & UI
│   ├── api/            # API routes (Next.js)
│   ├── signin/         # Magic link verification
│   ├── page.tsx        # Landing page
│   └── globals.css
├── components/
├── lib/                # auth, prisma client, utils
├── prisma/             # schema.prisma, migrations
├── middleware.ts
└── package.json
```

---

## Database Schema (overview)

(Abbreviated ER diagram, see `prisma/schema.prisma` for full model definitions.)

```
Admin ---< Package >--- Member
Member ---< Bill --- Receipt
Member ---< Notification
Member ---< StoreOrder >--- StoreOrderItem >--- StoreProduct
```

A sample `prisma` model snippet (example):

```prisma
model Admin {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  token     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Package {
  id       String   @id @default(cuid())
  name     String
  price    Float
  duration Int      // days
  features Json?
  createdAt DateTime @default(now())
}

model Member {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  phone     String?
  packageId String?
  package   Package? @relation(fields: [packageId], references: [id])
  status    String   @default("active")
  joinDate  DateTime @default(now())
}
```

---

## Authentication Flow

Passwordless magic link flow:

1. User enters email on login form.
2. Server generates a short‑lived JWT and persists a token record.
3. Email (magic link) sent to user with a verification route `/signin?token=`.
4. On link click, token is verified, session created via NextAuth, token cleared.

**Test backdoor tokens** used only for demos:

* `TEST_ADMIN_TOKEN` → creates/logs in `testuser@mail.com` as Admin
* `TEST_MEMBER_TOKEN` → creates/logs in `testuser@mail.com` as Member

---

## Workflows

### Member Onboarding

Admin adds member → Package assigned → Welcome email → Member receives login link → Member accesses dashboard

### Billing

Admin creates bill → Email notification created → Member views bill → Admin marks paid → Receipt auto-generated → Member downloads receipt

### Notifications

Admin composes notification → Select recipients → Email sent via Nodemailer → DB record created → Member sees notification in portal

### Store Orders

Member places order → Admin receives order notification → Admin updates status → Stock is decremented → Member views order history

---

## Environment variables

Create a `.env` file at the project root. Example `.env.example` below — **do not commit** your real secrets.

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# JWT (optional)
JWT_SECRET="your-jwt-secret"
JWT_EXPIRY="15m"

# Email (Gmail)
MAIL_USER="your-email@gmail.com"
MAIL_PASS="your-app-password"  # for Gmail app password
MAIL_FROM_NAME="Your Gym Name"
MAIL_FROM_EMAIL="no-reply@yourgym.com"

# App
NODE_ENV=development
PORT=3000

# Demo tokens (only for local/dev demo)
TEST_ADMIN_TOKEN="TEST_ADMIN_TOKEN"
TEST_MEMBER_TOKEN="TEST_MEMBER_TOKEN"
```

---

## Getting started (development)

Prerequisites: Node.js 18+, PostgreSQL

```bash
# 1. Clone
git clone <repository-url>
cd gym-management

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with correct DATABASE_URL and email credentials

# 4. Prisma generation & migrations
npx prisma generate
npx prisma migrate dev --name init

# 5. Start dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Production build

```bash
# Build
npm run build

# Start
npm start
```

*Use a process manager (pm2 / systemd) and set environment variables in the host environment.*

---

## Security & validation

* Magic link tokens should be short‑lived and one‑time use.
* Input validation on all API endpoints (server & client).
* Role‑based route protection (middleware) for Admin vs Member.
* Use HTTPS in production, secure cookies, and `NEXTAUTH_SECRET`.

---

## Useful dev notes

* Use `react-hot-toast` for user feedback in the UI.
* Use `date-fns` for date formatting and manipulations.
* `xlsx` is used to export reports to Excel.
* Tests: add integration tests for API endpoints and e2e for critical flows.

---

## Future enhancements

* Payment gateway (Stripe / Razorpay)
* Attendance tracking (QR codes)
* Workout plan management & personal trainers
* Mobile app (React Native)
* SMS notifications
* Multi‑gym support

---

## License

This project is open source under the **MIT License**. See [LICENSE](LICENSE).

---

## Author

GymPro — full‑stack gym management project built with Next.js, Prisma, and PostgreSQL.

---

### Full example files (quick snippets)

#### `package.json` (snippet)

```json
{
  "name": "gympro",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "react-dom": "18.x",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "next-auth": "^4.0.0",
    "nodemailer": "^6.0.0"
  }
}
```

#### Basic `lib/prisma.ts`

```ts
import { PrismaClient } from '@prisma/client'

declare global {
  // allow global prisma during hot reloads in development
  // eslint-disable-next-line
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma ?? new PrismaClient()
if (process.env.NODE_ENV === 'development') global.prisma = prisma
```

#### Example NextAuth config (`lib/auth.ts`) — minimal

```ts
import NextAuth from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'

export default NextAuth({
  adapter: PrismaAdapter(prisma as any),
  providers: [
    EmailProvider({
      // configure your email sending here (nodemailer)
      server: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      from: process.env.MAIL_FROM_EMAIL
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' }
})
```

---

If you'd like, I can now:

* ✨ Export this as a `README.md` file and provide it for download,
* 🖼️ Generate a simple Mermaid ER diagram and include it in the README,
* 🧾 Create a full `prisma/schema.prisma` file with all models,
* 🔧 Generate boilerplate API route templates (Next.js API handlers).

Tell me which one(s) you want next.
