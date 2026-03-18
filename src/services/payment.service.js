const { runQuery, getQuery, allQuery } = require("./helpers/service.helpers");

async function attemptPayment(invoiceId, result, idempotencyKey) {
  if (!["success", "failed"].includes(result)) {
    throw new Error("Invalid payment result");
  }

  if (!idempotencyKey) {
    throw new Error("Idempotency key is required");
  }

  // Check if idempotency key already exists
  const existingAttempt = await getQuery(
    "SELECT * FROM payment_attempts WHERE idempotency_key = ?",
    [idempotencyKey],
  );

  if (existingAttempt) {
    if (existingAttempt.invoice_id !== invoiceId) {
      throw new Error("Idempotency key already used for a different invoice");
    }

    const existingInvoice = await getQuery(
      "SELECT status FROM invoices WHERE id = ?",
      [existingAttempt.invoice_id],
    );

    return {
      invoiceId: existingAttempt.invoice_id,
      attemptNumber: existingAttempt.attempt_number,
      paymentStatus: existingAttempt.status,
      invoiceStatus: existingInvoice.status,
      idempotencyKey: existingAttempt.idempotency_key,
    };
  }

  // Get invoice
  const invoice = await getQuery("SELECT * FROM invoices WHERE id = ?", [
    invoiceId,
  ]);

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (invoice.status === "paid") {
    throw new Error("Invoice already paid");
  }

  // Get attempt number
  const attempts = await allQuery(
    "SELECT id FROM payment_attempts WHERE invoice_id = ?",
    [invoiceId],
  );
  const attemptNumber = attempts.length + 1;

  // Insert payment attempt
  await runQuery(
    "INSERT INTO payment_attempts (invoice_id, attempt_number, status, idempotency_key) VALUES (?, ?, ?, ?)",
    [invoiceId, attemptNumber, result, idempotencyKey],
  );

  // Update invoice based on result
  if (result === "success") {
    await runQuery(
      "UPDATE invoices SET status = ?, paid_at = CURRENT_TIMESTAMP WHERE id = ?",
      ["paid", invoiceId],
    );
  } else {
    await runQuery("UPDATE invoices SET status = ? WHERE id = ?", [
      "retry_pending",
      invoiceId,
    ]);
  }

  const updatedInvoice = await getQuery(
    "SELECT status FROM invoices WHERE id = ?",
    [invoiceId],
  );

  return {
    invoiceId,
    attemptNumber,
    paymentStatus: result,
    invoiceStatus: updatedInvoice.status,
    idempotencyKey,
  };
}

module.exports = {
  attemptPayment,
};
