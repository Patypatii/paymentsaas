# Payment Initiation & Routing SaaS Platform

## 1. Overview

### 1.1 Purpose

This platform provides **Payment Initiation as a Service (PIaaS)** for businesses that want to accept M-Pesa and bank-based payments **directly into their own accounts** without having direct access to Safaricom Daraja.

The platform abstracts Daraja integration, security, and compliance complexity while ensuring that **funds never pass through the platform**.

### 1.2 Key Principles

* No custody of funds
* No wallets or balances
* One master Daraja application
* Dynamic routing to merchant-owned PayBills / Tills / Bank PayBills
* Subscription-based SaaS model

---

## 2. Target Users

### 2.1 Merchants

* SMEs
* Startups
* Developers
* Corporates without Daraja access

### 2.2 Platform Operator

* Controls Daraja credentials
* Manages compliance, rate limits, and abuse

---

## 3. Supported Payment Types

### 3.1 M-Pesa STK Push

* Customer-initiated push
* Dynamic BusinessShortCode per merchant

### 3.2 C2B Payments

* Optional (requires Safaricom approval)

### 3.3 Bank Settlement

Supported **only via PayBills mapped to banks**:

* Bank PayBills
* Corporate PayBills settled to bank accounts
* Till numbers with merchant-configured bank sweeps

Not supported:

* Direct bank APIs
* EFT / RTGS
* Manual disbursements

---

## 4. System Architecture

### 4.1 High-Level Flow

1. Merchant integrates platform API
2. Platform authenticates request
3. Platform validates merchant and quota
4. Platform initiates Daraja request
5. Safaricom processes payment
6. Funds settle directly to merchant
7. Callback is normalized and forwarded

### 4.2 Components

* API Gateway
* Auth & API Key Service
* Merchant Registry
* Payment Orchestration Service
* Callback Processor
* Admin Panel
* Merchant Dashboard

---

## 5. Authentication & Security

### 5.1 API Authentication

* API Key per merchant
* HMAC-SHA256 request signing
* Timestamped requests

### 5.2 Rate Limiting

* Plan-based limits
* Per-IP throttling
* Burst protection

### 5.3 Network Security

* HTTPS only
* IP allowlisting (optional)
* Safaricom IP validation on callbacks

---

## 6. Merchant Onboarding

### 6.1 Registration

Required information:

* Business name
* Contact email
* Settlement type
* PayBill / Till / Bank PayBill

### 6.2 Verification

* Manual review
* Optional micro-transaction verification
* Signed consent agreement

### 6.3 Activation

* API key issued
* Plan assigned
* Status set to ACTIVE

---

## 7. API Design

### 7.1 Base URL

```
https://api.yourplatform.com/v1
```

### 7.2 Headers

```
Authorization: Bearer <API_KEY>
X-Signature: <HMAC>
X-Timestamp: <ISO8601>
```

---

### 7.3 Initiate STK Push

**Endpoint**

```
POST /payments/stk-push
```

**Request Body**

```json
{
  "phone": "2547XXXXXXXX",
  "amount": 1000,
  "reference": "INV-1001",
  "description": "Payment for order"
}
```

**Response**

```json
{
  "transaction_id": "tx_123",
  "status": "PENDING"
}
```

---

### 7.4 Webhook Callback (Merchant)

**Payload**

```json
{
  "transaction_id": "tx_123",
  "status": "SUCCESS",
  "mpesa_receipt": "QK123XYZ",
  "amount": 1000
}
```

---

## 8. Callback Handling

### 8.1 Safaricom Callback

* Validate source IP
* Validate payload signature
* Normalize response

### 8.2 Merchant Callback

* Retry with exponential backoff
* Idempotent delivery
* Failure alerts

---

## 9. Data Model

### 9.1 Merchants Table

* id
* business_name
* settlement_type
* shortcode
* status

### 9.2 API Keys Table

* id
* merchant_id
* key_hash
* plan

### 9.3 Transactions Table

* id
* merchant_id
* phone
* amount
* status
* mpesa_receipt

---

## 10. Admin Panel

### 10.1 Features

* Merchant approval / suspension
* Transaction monitoring
* Rate limit management
* System health dashboard
* Kill switch

### 10.2 Roles

* Super Admin
* Operations
* Compliance

---

## 11. Merchant Dashboard

### 11.1 Features

* API key management
* Transaction logs
* Webhook configuration
* Usage & billing
* Documentation access

---

## 12. Billing & Pricing

### 12.1 Model

Subscription-based

### 12.2 Example Plans

* Starter: 1,000 KES / month
* Growth: 5,000 KES / month
* Scale: Custom

---

## 13. Compliance & Legal

### 13.1 Platform Position

* Payment initiation provider
* No custody of funds

### 13.2 Merchant Agreement

Includes:

* Authorization to initiate payments
* Liability limitations
* Usage restrictions

---

## 14. Monitoring & Logging

* API request logs
* Daraja request logs
* Callback logs
* Fraud flags

---

## 15. Failure Handling

* Daraja downtime retries
* Circuit breakers
* Graceful degradation

---

## 16. Deployment

### 16.1 Infrastructure

* Cloud-based (AWS / GCP)
* Managed database
* Redis for rate limiting

### 16.2 Environments

* Sandbox
* Production

---

## 17. Roadmap

### Phase 1

* STK Push
* Merchant dashboard

### Phase 2

* Bank PayBill support
* Subscriptions

### Phase 3

* Advanced analytics
* Dedicated Daraja apps

---

## 18. Conclusion

This platform provides a scalable, compliant, and developer-friendly way to initiate M-Pesa and bank-settled payments without acting as a payment gateway or holding funds. Proper positioning, governance, and rate control are critical to long-term success.
