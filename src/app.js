const express = require("express");
const app = express();

app.use(express.json());

const customersRouter = require("./routes/customers.routes");
const subscriptionsRouter = require("./routes/subscriptions.routes");
const invoicesRouter = require("./routes/invoices.routes");
const paymentsRouter = require("./routes/payments.routes");

app.use("/customers", customersRouter);
app.use("/subscriptions", subscriptionsRouter);
app.use("/invoices", invoicesRouter);
app.use("/payments", paymentsRouter);

module.exports = app;
