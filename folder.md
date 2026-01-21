1. BACKEND (Standalone Project)

Purpose:
API, Daraja orchestration, security, subscriptions, webhooks, admin APIs.

backend/
├── src/
│   ├── server.ts
│   ├── app.ts
│
│   ├── config/
│   │   ├── env.ts
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── daraja.ts
│   │   └── security.ts
│
│   ├── routes/
│   │   ├── public.routes.ts
│   │   ├── merchant.routes.ts
│   │   ├── admin.routes.ts
│   │   └── index.ts
│
│   ├── modules/
│   │
│   │   ├── public/
│   │   │   ├── health.controller.ts
│   │   │   └── pricing.controller.ts
│   │
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.guard.ts
│   │   │   └── auth.types.ts
│   │
│   │   ├── merchants/
│   │   │   ├── merchant.controller.ts
│   │   │   ├── merchant.service.ts
│   │   │   ├── merchant.model.ts
│   │   │   └── merchant.validation.ts
│   │
│   │   ├── api-keys/
│   │   │   ├── apiKey.controller.ts
│   │   │   ├── apiKey.service.ts
│   │   │   └── apiKey.middleware.ts
│   │
│   │   ├── payments/
│   │   │   ├── payment.controller.ts
│   │   │   ├── payment.service.ts
│   │   │   ├── stkPush.service.ts
│   │   │   └── payment.types.ts
│   │
│   │   ├── callbacks/
│   │   │   ├── daraja.callback.controller.ts
│   │   │   ├── callback.validator.ts
│   │   │   └── callback.processor.ts
│   │
│   │   ├── webhooks/
│   │   │   ├── webhook.dispatcher.ts
│   │   │   ├── webhook.retry.ts
│   │   │   └── webhook.model.ts
│   │
│   │   ├── subscriptions/
│   │   │   ├── plans.model.ts
│   │   │   ├── usage.tracker.ts
│   │   │   └── billing.service.ts
│   │
│   │   ├── admin/
│   │   │   ├── admin.controller.ts
│   │   │   ├── admin.service.ts
│   │   │   └── admin.guard.ts
│   │
│   │   ├── compliance/
│   │   │   ├── audit.logger.ts
│   │   │   ├── fraud.rules.ts
│   │   │   └── consent.records.ts
│   │
│   │   └── health/
│   │       ├── health.controller.ts
│   │       └── metrics.service.ts
│
│   ├── common/
│   │   ├── middleware/
│   │   │   ├── rateLimiter.ts
│   │   │   ├── hmacVerifier.ts
│   │   │   └── errorHandler.ts
│   │   ├── utils/
│   │   │   ├── crypto.ts
│   │   │   ├── logger.ts
│   │   │   └── idempotency.ts
│   │   └── constants/
│   │       ├── errors.ts
│   │       └── plans.ts
│
│   └── database/
│       ├── migrations/
│       ├── seeds/
│       └── models/
│
├── tests/
├── docs/
│   ├── api.md
│   ├── webhooks.md
│   └── security.md
│
├── .env.example
├── package.json
└── tsconfig.json

Why this backend structure works

Public, merchant, and admin APIs are clearly isolated

Daraja logic is not mixed with merchant logic

Compliance and auditing are first-class modules

Easy to shut down a single merchant without downtime

2. PUBLIC WEBSITE (Marketing + Docs)

Purpose:
Landing pages, pricing, documentation, signup entry point.
NO authentication logic here.

website/
├── src/
│   ├── pages/
│   │   ├── index.tsx          // Landing page
│   │   ├── pricing.tsx
│   │   ├── docs.tsx
│   │   ├── contact.tsx
│   │   └── signup.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── hero/
│   │   ├── pricing/
│   │   ├── features/
│   │   └── cta/
│   │
│   ├── styles/
│   └── utils/
│
├── public/
├── next.config.js
└── package.json

Public site goal

Convert visitors → merchants
Nothing more. Nothing sensitive.

3. MERCHANT DASHBOARD (SaaS App)

Purpose:
Merchant onboarding, API keys, transactions, webhooks, billing.

merchant-dashboard/
├── src/
│   ├── pages/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── dashboard.tsx
│   │   ├── onboarding.tsx
│   │   ├── api-keys.tsx
│   │   ├── transactions.tsx
│   │   ├── webhooks.tsx
│   │   ├── billing.tsx
│   │   └── settings.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   ├── tables/
│   │   ├── forms/
│   │   ├── modals/
│   │   └── charts/
│   │
│   ├── services/
│   │   ├── api.ts
│   │   ├── payments.service.ts
│   │   └── billing.service.ts
│   │
│   ├── hooks/
│   ├── styles/
│   └── utils/
│
├── public/
├── next.config.js
└── package.json

Merchant UX principle

“I can see everything, control everything, and my money never touches you.”

4. ADMIN PANEL (Internal Only)

Purpose:
Risk control, monitoring, approvals, emergency shutdowns.

admin-panel/
├── src/
│   ├── pages/
│   │   ├── login.tsx
│   │   ├── dashboard.tsx
│   │   ├── merchants/
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   ├── transactions.tsx
│   │   ├── system-health.tsx
│   │   └── settings.tsx
│   │
│   ├── components/
│   │   ├── tables/
│   │   ├── charts/
│   │   └── alerts/
│   │
│   ├── services/
│   │   ├── api.ts
│   │   └── admin.service.ts
│   │
│   ├── styles/
│   └── utils/
│
├── public/
├── next.config.js
└── package.json

Admin rule

If admins can’t kill a merchant in one click, the system is unsafe.

