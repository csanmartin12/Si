// backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const { User } = require("../utils/db");
const { generateToken, setAuthCookie, clearAuthCookie } = require("../utils/jwt");

const router = express.Router();


function calcularEdad(fechaNac) {
  const hoy = new Date();
  const nac = new Date(fechaNac);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) {
    edad--;
  }
  return edad;
}


router.post("/register", async (req, res) => {
  try {
    const { fullName, email, username, password, birthDate } = req.body;

    if (!fullName || !email || !username || !password || !birthDate) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const edad = calcularEdad(birthDate);
    if (edad < 18) {
      return res.status(400).json({ error: "Debe ser mayor de 18 años" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email ya registrado" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: "Nombre de usuario ya registrado" });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      fullName,
      email,
      username,
      passwordHash,
      birthDate
    });

    const token = generateToken(user);
    setAuthCookie(res, token);

    res.status(201).json({
      message: "Usuario registrado correctamente",
      user: {
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        balance: user.balance
      }
    });
  } catch (err) {
    console.error("Error en register:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Debe ingresar usuario y contraseña" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    res.json({
      message: "Login exitoso",
      user: {
        username: user.username,
        fullName: user.fullName,
        balance: user.balance
      }
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});


router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  res.json({ message: "Sesión cerrada" });
});

module.exports = router;
