const express = require("express");
const router = express.Router();

const rutasAuth = require("./auth");
const rutasUsuario = require("./user");
const rutasJuego = require("./game");
const rutasHeartbeat = require("./heartbeat");

router.use("/auth", rutasAuth);
router.use("/usuario", rutasUsuario);
router.use("/juego", rutasJuego);
router.use(rutasHeartbeat); 

module.exports = router;
