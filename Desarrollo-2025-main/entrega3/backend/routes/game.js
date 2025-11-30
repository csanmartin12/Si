// backend/routes/game.js
const router = require("express").Router();
const { User, GameHistory } = require("../utils/db");
const { authRequired } = require("../utils/jwt");
const { evaluarApuestas } = require("../utils/payments");


router.post("/bet", authRequired, (req, res) => {
  const { bets } = req.body;

  if (!Array.isArray(bets) || bets.length === 0) {
    return res.status(400).json({ error: "Debe enviar al menos una apuesta" });
  }

  for (const bet of bets) {
    if (bet.type !== "single") {
      return res.status(400).json({ error: `Tipo de apuesta no permitido: ${bet.type}` });
    }

    const value = Number(bet.value);
    const amount = Number(bet.amount);

    if (isNaN(value) || value < 0 || value > 36) {
      return res.status(400).json({ error: "Número de apuesta inválido" });
    }

    if (isNaN(amount) || amount <= 0) {
      return  res.status(400).json({ error: "Monto inválido" });
    }
  }

  res.json({
    ok: true,
    message: "Apuestas validadas",
    totalBets: bets.length
  });
});


router.post("/spin", authRequired, async (req, res) => {
  try {
    const { bets } = req.body;

    if (!Array.isArray(bets) || bets.length === 0) {
      return res.status(400).json({ error: "Debe enviar apuestas" });
    }


    const user = await User.findById(req.user.id); 
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });


    const totalBet = bets.reduce((acc, b) => acc + Number(b.amount), 0);
    if (isNaN(totalBet) || totalBet <= 0) {
       return res.status(400).json({ error: "Total apostado inválido" });
    }

    if (user.balance < totalBet) {
      return res.status(400).json({ error: "Saldo insuficiente para apostar" });
    }


    const winningNumber = Math.floor(Math.random() * 37);

   
    const { total: netChange, detalles } = evaluarApuestas(
      bets.map(b => ({
        type: b.type,
        value: Number(b.value),
        amount: Number(b.amount)
      })),
      winningNumber
    );

    // Actualizar saldo
    user.balance += netChange;
    await user.save();

    // Guardar historial 
    await GameHistory.create({
      user: user._id,
      winningNumber,
      bets: detalles,
      netChange
    });


    res.json({
      message: "Giro ejecutado correctamente",
      winningNumber,
      netChange,
      balance: user.balance,
      bets: detalles
    });

  } catch (err) {
    console.error("Error en /api/game/spin:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/history", authRequired, async (req, res) => {
  try {
    const history = await GameHistory.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ history });

  } catch (err) {
    console.error("Error en /api/game/history:", err);
    res.status(500).json({ error: "Error al cargar historial" });
  }
});

module.exports = router;
