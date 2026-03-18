const express = require("express");
const router = express.Router();
const { generateInvoice } = require("../services/billing.service");

router.post("/", async (req, res) => {
  try {
    const { subscriptionId } = req.body || {};

    if (!subscriptionId) {
      return res.status(400).json({ error: "subscriptionId is required" });
    }

    const invoiceId = await generateInvoice(subscriptionId);

    return res.status(201).json({
      invoiceId,
      message: "Invoice generated successfully",
    });
  } catch (err) {
    if (err.message === "Subscription not found") {
      return res.status(404).json({ error: err.message });
    }

    if (err.message === "already exists") {
      return res.status(409).json({ error: err.message });
    }

    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
