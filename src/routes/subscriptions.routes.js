const express = require("express");
const router = express.Router();

const { createSubscription } = require("../services/billing.service");

router.post("/create", async (req, res) => {
  try {
    const { customerId, planName, monthlyAmount } = req.body || {};

    if (!customerId || !planName || monthlyAmount == null) {
      return res.status(400).json({
        error: "customerId, planName, and monthlyAmount are required",
      });
    }

    const pasrsedAmount = parseFloat(monthlyAmount);
    if (isNaN(pasrsedAmount) || pasrsedAmount < 0) {
      return res
        .status(400)
        .json({ error: "monthlyAmount must be a non-negative number" });
    }

    const subscriptionId = await createSubscription(
      customerId,
      planName,
      monthlyAmount,
    );

    return res.status(201).json({
      subscriptionId,
      message: "Subscription created successfully",
    });
  } catch (err) {
    if (err.message === "Customer not found") {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
