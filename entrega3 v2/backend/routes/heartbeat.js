const express = require("express");
const router = express.Router();

router.get("/heartbeat", (req, res) => {
  res.json({
    estado: "ok",
    horaServidor: new Date().toISOString(),
  });
});

module.exports = router;
