# Coolify Deployment Guide

This document provides the necessary configuration for hosting the PaymentSaas project on Coolify using Nixpacks.

## Project Structure & Ports

Each service is located in its own directory and requires specific port and domain configuration.

| Service | Base Directory | Port | Domain |
| :--- | :--- | :--- | :--- |
| **Backend API** | `/backend` | `5000` | `https://apipaylor.webnixke.com` |
| **Public Website** | `/website` | `3000` | `https://paylor.webnixke.com` |
| **Merchant Dashboard** | `/merchant-dashboard` | `3000` | `https://appaylor.webnixke.com` |
| **Admin Panel** | `/admin-panel` | `3000` | `https://adminpaylor.webnixke.com` |

## Build Configuration (Nixpacks)

In the Coolify configuration for each application, set the following commands:

- **Install Command**: `npm install`
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`

## Environment Variables

Ensure you copy the environment variables from the local `.env` files to the Coolify dashboard for each service.

- **Backend**: `/backend/.env`
- **Website**: `/website/.env.local`
- **Merchant Dashboard**: `/merchant-dashboard/.env.local`
- **Admin Panel**: `/admin-panel/.env.local`

> [!IMPORTANT]
> The `NODE_ENV` should be set to `production` in the backend environment variables.

## Verification

After deployment, verify that:
1. The website can reach the API (`https://apipaylor.webnixke.com/api/v1`).
2. M-Pesa callbacks correctly hit the backend at `https://apipaylor.webnixke.com/api/v1/public/callbacks/daraja`.
3. Login and registration work across the different domains.
