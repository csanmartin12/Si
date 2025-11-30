// backend/routes/heartbeat.js
const express = require("express");
const router = express.Router();

router.get("/heartbeat", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

module.exports = router;
