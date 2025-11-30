// backend/routes/user.js
const express = require("express");
const { authRequired } = require("../utils/jwt");
const { User, Transaction } = require("../utils/db");

const router = express.Router();


router.get("/profile", authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.auth.sub);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const lastTransactions = await Transaction.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      balance: user.balance,
      transactions: lastTransactions
    });
  } catch (err) {
    console.error("Error obteniendo perfil:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

router.post("/deposit", authRequired, async (req, res) => {
  try {
    const { amount } = req.body;
    const value = Number(amount);

    if (!Number.isFinite(value) || value <= 0) {
      return res.status(400).json({ error: "Monto inválido" });
    }

    const user = await User.findById(req.auth.sub);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    user.balance += value;
    await user.save();

    const tx = await Transaction.create({
      user: user._id,
      type: "deposit",
      amount: value,
      balanceAfter: user.balance
    });

    res.json({
      message: "Depósito realizado",
      balance: user.balance,
      transaction: tx
    });
  } catch (err) {
    console.error("Error en depósito:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});


router.post("/withdraw", authRequired, async (req, res) => {
  try {
    const { amount } = req.body;
    const value = Number(amount);

    if (!Number.isFinite(value) || value <= 0) {
      return res.status(400).json({ error: "Monto inválido" });
    }

    const user = await User.findById(req.auth.sub);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    if (user.balance < value) {
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    user.balance -= value;
    await user.save();

    const tx = await Transaction.create({
      user: user._id,
      type: "withdraw",
      amount: value,
      balanceAfter: user.balance
    });

    res.json({
      message: "Retiro realizado",
      balance: user.balance,
      transaction: tx
    });
  } catch (err) {
    console.error("Error en retiro:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

module.exports = router;
