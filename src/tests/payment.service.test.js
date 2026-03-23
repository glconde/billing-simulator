// service level tests
const {
  createCustomer,
  createSubscription,
  generateInvoice,
} = require("../services/billing.service");

const { attemptPayment } = require("../services/payment.service");

const db = require("../db/connection");

function resetDb() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("DELETE FROM payment_attempts");
      db.run("DELETE FROM invoices");
      db.run("DELETE FROM subscriptions");
      db.run("DELETE FROM customers", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

describe("Payment Service", () => {
  beforeEach(async () => {
    await resetDb();
  });

  test("failed payment sets invoice to retry_pending", async () => {
    const customerId = await createCustomer("Test", "test1@email.com");
    const subscriptionId = await createSubscription(customerId, "Basic", 10);
    const invoiceId = await generateInvoice(subscriptionId);

    const result = await attemptPayment(invoiceId, "failed", "pay_test_1");

    expect(result.paymentStatus).toBe("failed");
    expect(result.invoiceStatus).toBe("retry_pending");
  });

  test("successful payment sets invoice to paid", async () => {
    const customerId = await createCustomer("Test", "test2@email.com");
    const subscriptionId = await createSubscription(customerId, "Basic", 10);
    const invoiceId = await generateInvoice(subscriptionId);

    const result = await attemptPayment(invoiceId, "success", "pay_test_2");

    expect(result.paymentStatus).toBe("success");
    expect(result.invoiceStatus).toBe("paid");
  });

  test("idempotency prevents duplicate payment attempts", async () => {
    const customerId = await createCustomer("Test", "test3@email.com");
    const subscriptionId = await createSubscription(customerId, "Basic", 10);
    const invoiceId = await generateInvoice(subscriptionId);

    const first = await attemptPayment(invoiceId, "success", "pay_test_3");

    const second = await attemptPayment(invoiceId, "success", "pay_test_3");

    expect(second.attemptNumber).toBe(first.attemptNumber);
    expect(second.idempotencyKey).toBe("pay_test_3");
  });
});
