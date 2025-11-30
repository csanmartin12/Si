const express = require("express");
const { Usuario, Partida } = require("../utils/db");
const { authRequerida } = require("../utils/jwt");
const { evaluarApuestas } = require("../utils/payments");

const router = express.Router();

router.post("/apuesta", authRequerida, (req, res) => {
  const { apuestas } = req.body;

  if (!Array.isArray(apuestas) || apuestas.length === 0) {
    return res.status(400).json({ error: "Debe enviar al menos una apuesta" });
  }

  for (const ap of apuestas) {
    const monto = Number(ap.monto);
    if (!ap.tipo || !Number.isFinite(monto) || monto <= 0) {
      return res.status(400).json({ error: "Apuesta inválida" });
    }
  }

  res.json({ mensaje: "Apuestas válidas", totalApuestas: apuestas.length });
});

router.post("/giro", authRequerida, async (req, res) => {
  try {
    const { apuestas } = req.body;

    if (!Array.isArray(apuestas) || apuestas.length === 0) {
      return res.status(400).json({ error: "Debe enviar apuestas" });
    }

    const usuario = await Usuario.findById(req.idUsuario);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    const totalApostado = apuestas.reduce(
      (acc, a) => acc + Number(a.monto || 0),
      0
    );

    if (!Number.isFinite(totalApostado) || totalApostado <= 0) {
      return res.status(400).json({ error: "Total apostado inválido" });
    }

    if (usuario.saldo < totalApostado) {
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    const numeroGanador = Math.floor(Math.random() * 37);

    const { cambioNetoTotal, detalles } = evaluarApuestas(
      apuestas.map((a) => ({
        tipo: a.tipo,
        valor: a.valor != null ? Number(a.valor) : null,
        monto: Number(a.monto),
      })),
      numeroGanador
    );

    usuario.saldo += cambioNetoTotal;
    await usuario.save();

    const partida = await Partida.create({
      usuario: usuario._id,
      numeroGanador,
      apuestas: detalles,
      cambioNetoTotal,
    });

    res.json({
      mensaje: "Giro ejecutado",
      numeroGanador,
      cambioNetoTotal,
      saldo: usuario.saldo,
      apuestas: detalles,
      idPartida: partida._id,
    });
  } catch (err) {
    console.error("Error en /juego/giro:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
});


router.get("/historial", authRequerida, async (req, res) => {
  try {
    const partidas = await Partida.find({ usuario: req.idUsuario })
      .sort({ creadoEn: -1 })
      .limit(20)
      .lean();

    res.json({ partidas });
  } catch (err) {
    console.error("Error en /juego/historial:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
});

module.exports = router;
