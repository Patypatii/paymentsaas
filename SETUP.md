# Payment SaaS Platform - Setup Guide

## Overview

This platform consists of 4 separate projects:
1. **Backend API** (Port 3000)
2. **Public Website** (Port 3000 - different from backend in production)
3. **Merchant Dashboard** (Port 3001)
4. **Admin Panel** (Port 3002)

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (for local development)

## Quick Start

### 1. Start Infrastructure

```bash
# Start PostgreSQL and Redis
docker-compose up -d
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run db:migrate
npm run db:seed
npm run dev
```

Backend will run on `http://localhost:3000`

### 3. Public Website Setup

```bash
cd website
npm install
npm run dev
```

Website will run on `http://localhost:3000` (or different port if backend is running)

### 4. Merchant Dashboard Setup

```bash
cd merchant-dashboard
npm install
npm run dev
```

Dashboard will run on `http://localhost:3001`

### 5. Admin Panel Setup

```bash
cd admin-panel
npm install
npm run dev
```

Admin panel will run on `http://localhost:3002`

## Environment Variables

### Backend (.env)

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST`, `REDIS_PORT` - Redis configuration
- `JWT_SECRET` - Secret for JWT tokens
- `API_KEY_SECRET` - Secret for API key hashing
- `HMAC_SECRET` - Secret for HMAC signatures
- `DARAJ_A_CONSUMER_KEY`, `DARAJ_A_CONSUMER_SECRET` - Safaricom Daraja credentials
- `DARAJ_A_SHORTCODE`, `DARAJ_A_PASSKEY` - Daraja payment details

## Default Admin Account

After running `npm run db:seed`, default admin credentials:
- Email: `admin@yourplatform.com` (from .env)
- Password: `change-this-password` (from .env)

**Change these immediately in production!**

## API Endpoints

### Public Endpoints
- `GET /v1/public/health` - Health check
- `GET /v1/public/pricing` - Pricing plans
- `POST /v1/public/auth/merchant/login` - Merchant login
- `POST /v1/public/auth/admin/login` - Admin login
- `POST /v1/public/merchants/register` - Merchant registration
- `POST /v1/public/callbacks/daraja` - Daraja callback (webhook)

### Merchant Endpoints (JWT Auth)
- `GET /v1/merchants/profile` - Get merchant profile
- `GET /v1/merchants/api-keys` - List API keys
- `POST /v1/merchants/api-keys` - Create API key
- `DELETE /v1/merchants/api-keys/:keyId` - Revoke API key
- `GET /v1/merchants/subscription` - Get subscription
- `POST /v1/merchants/subscription` - Create/update subscription

### Payment Endpoints (API Key Auth)
- `POST /v1/merchants/payments/stk-push` - Initiate STK Push
- `GET /v1/merchants/payments/transactions` - List transactions
- `GET /v1/merchants/payments/transactions/:id` - Get transaction

### Admin Endpoints (Admin JWT Auth)
- `GET /v1/admin/stats` - System statistics
- `GET /v1/admin/merchants` - List merchants
- `GET /v1/admin/merchants/:id` - Get merchant details
- `POST /v1/admin/merchants/:id/approve` - Approve merchant
- `POST /v1/admin/merchants/:id/suspend` - Suspend merchant
- `POST /v1/admin/merchants/:id/reject` - Reject merchant

## Testing the System

1. **Register a Merchant**: Visit `http://localhost:3001/register`
2. **Approve Merchant**: Login to admin panel and approve the merchant
3. **Create API Key**: Login to merchant dashboard and create an API key
4. **Initiate Payment**: Use the API key to call the STK Push endpoint

## Production Deployment

1. Set up production database (managed PostgreSQL)
2. Set up production Redis
3. Configure environment variables
4. Build and deploy each application separately
5. Set up reverse proxy (nginx) for routing
6. Configure SSL certificates
7. Set up monitoring and logging

## Notes

- The backend uses PostgreSQL for data persistence
- Redis is used for rate limiting and caching
- All applications are separate and can be deployed independently
- The public website is statically generated and can be hosted on CDN
- Merchant dashboard and admin panel require authentication
