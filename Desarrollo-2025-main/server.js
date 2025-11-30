const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

// Servidor express de archivos
app.use(express.static(path.join(__dirname, "public")));

// Respuesta
app.get("/", (req, res) => {
    res.send("Servidor Express funcionando con HTTPS");
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

