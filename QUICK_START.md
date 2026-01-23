# 🚀 Quick Start Guide

Get the Payment SaaS Platform running in 5 minutes!

## Step 1: Start Infrastructure (2 minutes)

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify they're running
docker ps
```

## Step 2: Setup Backend (2 minutes)

```bash
cd backend

# Install dependencies
npm install

# Create environment file
# Windows:
copy .env.example .env
# Linux/Mac:
# cp .env.example .env

# Edit .env and add your Daraja credentials:
# - DARAJ_A_CONSUMER_KEY=your-key
# - DARAJ_A_CONSUMER_SECRET=your-secret
# - DARAJ_A_SHORTCODE=your-shortcode
# - DARAJ_A_PASSKEY=your-passkey
# - JWT_SECRET=generate-a-random-string
# - API_KEY_SECRET=generate-a-random-string
# - HMAC_SECRET=generate-a-random-string

# Run database migrations
npm run db:migrate

# Seed database (creates default admin)
npm run db:seed

# Start backend server
npm run dev
```

Backend should now be running on `http://localhost:3000`

## Step 3: Setup Frontend Applications (1 minute)

Open **3 new terminal windows**:

### Terminal 1 - Public Website
```bash
cd website
npm install
npm run dev
```
Runs on `http://localhost:3000` (or next available port)

### Terminal 2 - Merchant Dashboard
```bash
cd merchant-dashboard
npm install
npm run dev
```
Runs on `http://localhost:3001`

### Terminal 3 - Admin Panel
```bash
cd admin-panel
npm install
npm run dev
```
Runs on `http://localhost:3002`

## Step 4: Test the System

### 1. Access Admin Panel
- Go to `http://localhost:3002/login`
- Login with default credentials (from .env):
  - Email: `admin@yourplatform.com`
  - Password: `change-this-password`

### 2. Register a Merchant
- Go to `http://localhost:3001/register`
- Fill in merchant details
- Submit registration

### 3. Approve Merchant
- Go back to Admin Panel (`http://localhost:3002/merchants`)
- Click "Approve" on the pending merchant
- Copy the API key shown

### 4. Test Payment API
```bash
# Use the API key from step 3
curl -X POST http://localhost:3000/v1/merchants/payments/stk-push \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "254712345678",
    "amount": 100,
    "reference": "TEST-001",
    "description": "Test payment"
  }'
```

## 🎉 You're Done!

The system is now running. Check:
- ✅ Backend API: `http://localhost:3000/v1/public/health`
- ✅ Public Website: `http://localhost:3000` (or check terminal)
- ✅ Merchant Dashboard: `http://localhost:3001`
- ✅ Admin Panel: `http://localhost:3002`

## Troubleshooting

### Database Connection Error
```bash
# Check if PostgreSQL is running
docker ps

# Check logs
docker-compose logs postgres
```

### Redis Connection Error
```bash
# Check if Redis is running
docker ps

# Check logs
docker-compose logs redis
```

### Port Already in Use
- Backend uses port 3000
- If port 3000 is taken, the website will use the next available port
- Check terminal output for actual ports

### Module Not Found Errors
```bash
# Make sure you ran npm install in each directory
cd backend && npm install
cd ../website && npm install
cd ../merchant-dashboard && npm install
cd ../admin-panel && npm install
```

## Next Steps

1. **Configure Daraja Credentials**: Add real Safaricom Daraja API credentials
2. **Change Default Passwords**: Update admin password in .env and re-seed
3. **Test Full Flow**: Register → Approve → Create API Key → Make Payment
4. **Review Documentation**: Check `COMPLETE_SYSTEM_SUMMARY.md` for full details

## Need Help?

- Check `SETUP.md` for detailed setup instructions
- Check `COMPLETE_SYSTEM_SUMMARY.md` for system overview
- Check `backend/PROGRESS.md` for development details
