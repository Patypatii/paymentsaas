# Payment Initiation & Routing SaaS Platform

A complete, production-ready Payment Initiation as a Service (PIaaS) platform for M-Pesa and bank-based payments.

## 🎉 System Status: COMPLETE & READY

This platform has been fully built from scratch and is ready for testing and deployment.

## 🏗️ Architecture

This platform consists of **4 separate projects**:

1. **Backend API** (`backend/`) - Express.js/TypeScript API server (Port 3000)
2. **Public Website** (`website/`) - Next.js marketing site
3. **Merchant Dashboard** (`merchant-dashboard/`) - Next.js merchant interface (Port 3001)
4. **Admin Panel** (`admin-panel/`) - Next.js admin interface (Port 3002)

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+ (via Docker)
- Redis 7+ (via Docker)

### 1. Start Infrastructure
```bash
docker-compose up -d
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Daraja credentials
npm run db:migrate
npm run db:seed
npm run dev
```

### 3. Setup Frontend Applications
```bash
# Public Website
cd website && npm install && npm run dev

# Merchant Dashboard (new terminal)
cd merchant-dashboard && npm install && npm run dev

# Admin Panel (new terminal)
cd admin-panel && npm install && npm run dev
```

## 📚 Documentation

- **`QUICK_START.md`** - Get running in 5 minutes ⚡
- **`SETUP.md`** - Detailed setup instructions
- **`COMPLETE_SYSTEM_SUMMARY.md`** - Complete system overview
- **`documentation.md`** - System requirements and specifications
- **`uiux.md`** - UI/UX design guidelines
- **`folder.md`** - Detailed project structure
- **`backend/PROGRESS.md`** - Development progress

## ✨ Features

- ✅ Merchant registration and onboarding
- ✅ API key management
- ✅ M-Pesa STK Push payment processing
- ✅ Webhook delivery system
- ✅ Subscription plans and billing
- ✅ Admin merchant management
- ✅ Audit logging and compliance
- ✅ Rate limiting and security
- ✅ Dark theme UI across all applications

## 🔑 Default Admin Credentials

After running `npm run db:seed`:
- **Email**: `admin@yourplatform.com` (from .env)
- **Password**: `change-this-password` (from .env)

⚠️ **Change these immediately in production!**

## 🚀 API Endpoints

- **Public**: `/v1/public/*` - Health, pricing, auth, registration
- **Merchant**: `/v1/merchants/*` - Profile, API keys, subscriptions (JWT auth)
- **Payments**: `/v1/merchants/payments/*` - STK Push, transactions (API key auth)
- **Admin**: `/v1/admin/*` - System stats, merchant management (Admin JWT auth)

See `COMPLETE_SYSTEM_SUMMARY.md` for complete API documentation.

## 🎯 Next Steps

1. Follow `QUICK_START.md` to get the system running
2. Configure your Daraja API credentials
3. Test the complete payment flow
4. Review security settings for production
5. Deploy to your infrastructure

## 📦 Technology Stack

**Backend**: Node.js, Express.js, TypeScript, PostgreSQL, Redis  
**Frontend**: Next.js, React, TypeScript, Tailwind CSS  
**Security**: JWT, bcrypt, HMAC-SHA256, rate limiting

## 📝 Project Structure

See `folder.md` for detailed structure, or check:
- `backend/src/` - Backend source code
- `website/src/` - Public website pages
- `merchant-dashboard/src/` - Merchant portal
- `admin-panel/src/` - Admin interface

## 🎉 Ready to Use!

The system is fully functional and ready for testing. All components have been built and integrated. Start with `QUICK_START.md` to get running!
