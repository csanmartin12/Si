const express = require("express");
const bcrypt = require("bcrypt");
const { Usuario } = require("../utils/db");
const { crearToken } = require("../utils/jwt");

const router = express.Router();
const SALT_ROUNDS = 10;


router.post("/registro", async (req, res) => {
  try {
    const {
      nombreUsuario,
      nombreCompleto,
      correo,
      fechaNacimiento,
      contrasena,
    } = req.body;

    if (!nombreUsuario || !nombreCompleto || !correo || !fechaNacimiento || !contrasena) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const existente = await Usuario.findOne({
      $or: [{ nombreUsuario }, { correo }],
    });

    if (existente) {
      return res.status(400).json({ error: "Usuario o correo ya registrado" });
    }

    const fechaNac = new Date(fechaNacimiento);
    const hoy = new Date();
    const edad =
      hoy.getFullYear() -
      fechaNac.getFullYear() -
      (hoy < new Date(hoy.getFullYear(), fechaNac.getMonth(), fechaNac.getDate()) ? 1 : 0);

    if (edad < 18) {
      return res.status(400).json({ error: "Debe ser mayor de 18 años" });
    }

    const contrasenaHash = await bcrypt.hash(contrasena, SALT_ROUNDS);

    const usuario = await Usuario.create({
      nombreUsuario,
      nombreCompleto,
      correo,
      fechaNacimiento: fechaNac,
      contrasenaHash,
      saldo: 0,
    });

    res.status(201).json({ mensaje: "Usuario registrado", id: usuario._id });
  } catch (err) {
    console.error("Error en /auth/registro:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { nombreUsuario, contrasena } = req.body;

    if (!nombreUsuario || !contrasena) {
      return res.status(400).json({ error: "Debe enviar usuario y contraseña" });
    }

    const usuario = await Usuario.findOne({ nombreUsuario });
    if (!usuario) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const coincide = await bcrypt.compare(contrasena, usuario.contrasenaHash);
    if (!coincide) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = crearToken(usuario._id.toString());

    res.cookie("tokenSesion", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60 * 1000,
    });

    res.json({ mensaje: "Login exitoso" });
  } catch (err) {
    console.error("Error en /auth/login:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
});


router.post("/logout", (req, res) => {
  res.clearCookie("tokenSesion");
  res.json({ mensaje: "Sesión cerrada" });
});

module.exports = router;
