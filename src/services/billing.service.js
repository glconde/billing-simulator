const { runQuery, getQuery } = require("./helpers/service.helpers");

async function createCustomer(name, email) {
  const sql = "INSERT INTO customers (name, email) VALUES (?, ?)";
  const { lastID: customerId } = await runQuery(sql, [name, email]);
  return customerId;
}

async function createSubscription(customerId, planName, monthlyAmount) {
  const customer = await getQuery("SELECT id FROM customers WHERE id = ?", [
    customerId,
  ]);

  if (!customer) {
    throw new Error("Customer not found");
  }

  const sql =
    "INSERT INTO subscriptions (customer_id, plan_name, monthly_amount, status) VALUES (?, ?, ?, ?)";
  const { lastID: subscriptionId } = await runQuery(sql, [
    customerId,
    planName,
    monthlyAmount,
    "active",
  ]);
  return subscriptionId;
}

async function generateInvoice(subscriptionId) {
  // Get subscription details
  const subscription = await getQuery(
    "SELECT * FROM subscriptions WHERE id = ?",
    [subscriptionId],
  );
  if (!subscription) throw new Error("Subscription not found");

  if (subscription.status !== "active") {
    throw new Error("Cannot generate invoice for inactive subscription");
  }

  // Calculate billing period (current month)
  const now = new Date();
  const billingPeriod = now.toISOString().slice(0, 7); // YYYY-MM

  // Amount is monthly_amount
  const amount = subscription.monthly_amount;

  // duplicate invoice check
  const existingInvoice = await getQuery(
    "SELECT id FROM invoices WHERE subscription_id = ? AND billing_period = ?",
    [subscriptionId, billingPeriod],
  );

  if (existingInvoice) {
    throw new Error("Invoice for this period already exists");
  }

  const sql =
    "INSERT INTO invoices (subscription_id, amount, status, billing_period) VALUES (?, ?, ?, ?)";
  const { lastID: invoiceId } = await runQuery(sql, [
    subscriptionId,
    amount,
    "pending",
    billingPeriod,
  ]);
  return invoiceId;
}

module.exports = {
  createCustomer,
  createSubscription,
  generateInvoice,
};
