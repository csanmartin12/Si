const express = require("express");
const { Usuario, Transaccion } = require("../utils/db");
const { authRequerida } = require("../utils/jwt");

const router = express.Router();


router.get("/perfil", authRequerida, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.idUsuario).lean();
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({
      nombreUsuario: usuario.nombreUsuario,
      nombreCompleto: usuario.nombreCompleto,
      correo: usuario.correo,
      fechaNacimiento: usuario.fechaNacimiento,
      saldo: usuario.saldo,
    });
  } catch (err) {
    console.error("Error en /usuario/perfil:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
});


router.post("/deposito", authRequerida, async (req, res) => {
  try {
    const { monto } = req.body;
    const valor = Number(monto);

    if (!Number.isFinite(valor) || valor <= 0) {
      return res.status(400).json({ error: "Monto inválido" });
    }

    const usuario = await Usuario.findById(req.idUsuario);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    usuario.saldo += valor;
    await usuario.save();

    await Transaccion.create({
      usuario: usuario._id,
      tipo: "deposito",
      monto: valor,
    });

    res.json({ mensaje: "Depósito realizado", saldo: usuario.saldo });
  } catch (err) {
    console.error("Error en /usuario/deposito:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
});

router.post("/retiro", authRequerida, async (req, res) => {
  try {
    const { monto } = req.body;
    const valor = Number(monto);

    if (!Number.isFinite(valor) || valor <= 0) {
      return res.status(400).json({ error: "Monto inválido" });
    }

    const usuario = await Usuario.findById(req.idUsuario);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    if (usuario.saldo < valor) {
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    usuario.saldo -= valor;
    await usuario.save();

    await Transaccion.create({
      usuario: usuario._id,
      tipo: "retiro",
      monto: valor,
    });

    res.json({ mensaje: "Retiro realizado", saldo: usuario.saldo });
  } catch (err) {
    console.error("Error en /usuario/retiro:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
});

module.exports = router;
