const express = require("express");
const router = express.Router();

const { createCustomer } = require("../services/billing.service");

router.post("/create", async (req, res) => {
  try {
    const { name, email } = req.body || {};

    if (!name || !email) {
      return res.status(400).json({ error: "name and email are required" });
    }

    const customerId = await createCustomer(name, email);

    return res.status(201).json({
      customerId,
      message: "Customer created successfully",
    });
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.status(409).json({ error: "Email already exists" });
    }
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
