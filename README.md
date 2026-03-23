# Subscription Billing Simulator

A backend service that models core billing workflows including invoice generation, payment retries, and idempotent payment handling.

Built as a focused exercise in backend system design, emphasizing data integrity, state transitions, and failure handling rather than UI.

---

## Overview

This project simulates a simplified subscription billing system where:

- Customers subscribe to plans
- Invoices are generated per billing period
- Payments can succeed or fail
- Failed payments trigger retry logic
- Duplicate payment requests are prevented through idempotency

The goal is to demonstrate how backend systems handle **stateful workflows and edge cases**, not just CRUD operations.

---

## Key Features

- **Invoice lifecycle management**
  - `pending → retry_pending → paid`

- **Idempotent payment processing**
  - Prevents duplicate charges using idempotency keys

- **Retry handling**
  - Failed payments transition invoices into a retryable state

- **Data integrity rules**
  - One invoice per subscription per billing period
  - Cannot pay an already paid invoice
  - Idempotency keys cannot be reused across invoices

- **Layered architecture**
  - Route layer (HTTP handling)
  - Service layer (business logic)
  - Database layer (SQLite)

---

## Tech Stack

- Node.js
- Express
- SQLite
- Jest (basic tests)

---

## API Endpoints

### Create customer
POST /customers/create

```json
{
  "name": "John Doe",
  "email": "john@email.com"
}
```

### Create subscription
POST /subscriptions/create

```json
{
  "customerId": 1,
  "planName": "Pro",
  "monthlyAmount": 19.99
}
```

### Generate invoice
POST /invoices/generate
```json
{
  "subscriptionId": 1
}
```

### Attempt payment
```json
{
  "invoiceId": 1,
  "result": "failed",
  "idempotencyKey": "pay_001"
}
```

### Example Flow
```text
1. Create subscription
2. Generate invoice → status: pending

3. Attempt payment (failed)
   → invoice becomes retry_pending

4. Retry payment (success)
   → invoice becomes paid

5. Replay same idempotency key
   → no duplicate payment created

6. Attempt payment on paid invoice
   → rejected
```

### Design Notes
This project intentionally focuses on backend concerns that appear in real systems:

- Idempotency -Prevents duplicate financial transactions during retries or network issues.
- State transitions - Explicit modeling of invoice states avoids invalid operations.
- Separation of concerns - Business logic is isolated from HTTP routing.
- Deterministic behavior - Payment outcomes are controlled inputs to allow predictable testing.

### Limitations
- No authentication or user isolation
- No external payment gateway integration
- Billing periods are simplified (monthly only)
- No background job processing for retries

### Future Improvements
- Integration with payment providers (e.g., Stripe simulation)
- Scheduled retry system (cron or queue)
- Multi-currency support
- Per-user account isolation
- Event logging for auditing

### Why this project
Built to practice designing backend systems that handle:
- failure scenarios
- duplicate requests
- data consistency

## 👤 Author

George Louie Conde  
Software Developer  
Calgary, AB  
[LinkedIn](https://linkedin.com/in/glconde)  
[GitHub](https://github.com/glconde)