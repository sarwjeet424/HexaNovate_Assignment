# KlearStack AI — Landing Page

**Hexanovate Round 2 Assignment — MarTech Technical Lead**

## Live URL
> _Deploy to Vercel and paste URL here_

## Tech Stack
| Layer | Choice |
|-------|--------|
| Frontend | React 19 + Vite 8 + TypeScript 7 |
| Styling | Tailwind CSS v4 + Framer Motion |
| Forms | React Hook Form + Zod |
| Backend (local) | Node.js + Express |
| Backend (Vercel) | Serverless functions in `/api` |
| CRM (P1) | HubSpot free tier |
| Sheets (P1) | Google Sheets API v4 |
| Email (P2) | Resend |
| Calendar (P2) | Google Calendar API |

---

## Local Development

### Prerequisites
- Node.js 20+
- npm

### Setup

```bash
# Clone the repo
git clone <repo-url>
cd project-1

# Install client deps
cd client && npm install && cd ..

# Install server deps
cd server && npm install && cd ..

# Copy env example
cp .env.example server/.env
# Fill in your API keys in server/.env

# Start client (http://localhost:5173)
cd client && npm run dev

# Start server in a separate terminal (http://localhost:3001)
cd server && npm run dev
```

---

## Environment Variables (Vercel)

Configure these in Vercel Project → Settings → Environment Variables:

| Variable | Required | Purpose |
|----------|----------|---------|
| `HUBSPOT_API_KEY` | P1 | HubSpot Private App token |
| `GOOGLE_SHEET_ID` | P1 | Google Sheet ID |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | P1+P2 | Service account JSON (single line) |
| `GOOGLE_CALENDAR_ID` | P2 | Calendar ID (default: `primary`) |
| `RESEND_API_KEY` | P2 | Resend API key |
| `EMAIL_FROM` | P2 | Verified sender address |
| `NOTIFY_EMAIL` | P2 | Notification recipient |
| `CLIENT_ORIGIN` | All | Your Vercel frontend URL |

---

## Priority Completion Status

| Priority | Feature | Status |
|----------|---------|--------|
| P0 | Header + mega menu (responsive, sticky) | ✅ Complete |
| P0 | Lead gen form (full validation, UX states) | ✅ Complete |
| P0 | ROI Calculator (exact spreadsheet logic) | ✅ Complete |
| P0 | Footer | ✅ Complete |
| P0 | Responsive 360–1920px | ✅ Complete |
| P1 | HubSpot CRM integration | ✅ Complete (needs API key) |
| P1 | Google Sheets row append | ✅ Complete (needs SA key) |
| P2 | Email notification via Resend | ✅ Complete (needs API key) |
| P2 | Google Calendar booking | ✅ Complete (needs SA key) |
| P3 | Framer Motion animations | ✅ Complete |
| P3 | Accessibility (keyboard, ARIA) | ✅ Complete |

---

## ROI Calculator — Verification Table

From the Logic & Pricing sheet:

| Document Type | Model | Volume | Salary | Net Monthly Savings | Annual Savings | Equiv. Resources |
|---------------|-------|--------|--------|---------------------|----------------|-----------------|
| Bank Cheques | Single | 36,000 | ₹30,000 | ₹35,916.67 | ₹4,31,000 | 2 |
| Bank Cheques | Single | 36,000 | ₹73,000 | ₹85,916.67 | ₹10,31,000 | 2 |
| Invoices | Single | 1,20,000 | ₹50,000 | ₹1,74,400 | ₹20,92,800 | 4 |

---

## Folder Structure

```
project-1/
├── client/                   # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/       # Header, Footer
│   │   │   ├── sections/     # HeroForm, ROICalculator, IntegrationBanner
│   │   │   └── ui/           # (reusable primitives)
│   │   ├── lib/              # roi-calculator, validators, utils
│   │   ├── types/            # TypeScript interfaces
│   │   ├── constants/        # Nav items, options, domains list
│   │   └── styles/           # globals.css (Tailwind v4)
│   └── vite.config.ts
├── server/                   # Node.js + Express (local dev)
│   └── src/
│       ├── routes/           # leads.js, calendar.js
│       └── services/         # crm.js, sheets.js, email.js, calendar.js
├── api/                      # Vercel serverless functions
│   ├── submit-lead.js
│   └── book-calendar.js
├── .env.example
├── vercel.json
└── README.md
```
