const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const { conectarDB } = require("./utils/db");

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(cookieParser());


app.use(express.static(path.join(__dirname, "..", "frontend")));
const rutasAPI = require("./routes");
app.use("/api", rutasAPI);


conectarDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
});
