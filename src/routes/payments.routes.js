const express = require("express");
const router = express.Router();
const { attemptPayment } = require("../services/payment.service");

router.post("/", async (req, res) => {
  try {
    const { invoiceId, result, idempotencyKey } = req.body || {};
    if (!invoiceId || !result || !idempotencyKey) {
      return res.status(400).json({
        error: "invoiceId, result, and idempotencyKey are required",
      });
    }
    if (!["success", "failed"].includes(result)) {
      return res
        .status(400)
        .json({ error: "result must be either 'success' or 'failed'" });
    }
    const paymentResult = await attemptPayment(
      invoiceId,
      result,
      idempotencyKey,
    );
    return res.status(201).json({
      message: "Payment processed successfully",
      payment: paymentResult,
    });
  } catch (err) {
    if (err.message === "Invalid payment result") {
      return res.status(400).json({ error: err.message });
    }
    if (err.message === "Invoice not found") {
      return res.status(404).json({ error: err.message });
    }
    if (
      err.message === "Invoice already paid" ||
      err.message === "Idempotency key already used for a different invoice"
    ) {
      return res.status(409).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
