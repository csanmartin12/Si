const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const { connectDB } = require('./utils/db');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(express.static(path.join(__dirname, '../frontend')));

app.use("/api", require("./routes/index"));


app.use('/api', routes);


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});


app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ 
    error: 'Error del servidor',
    message: 'Ocurrió un error inesperado' 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});