// backend/routes/index.js
const router = require("express").Router();


const authRoutes = require("./auth");
const userRoutes = require("./user");
const gameRoutes = require("./game");
const heartbeatRoutes = require("./heartbeat");


router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/game", gameRoutes);


router.use(heartbeatRoutes);

module.exports = router;
