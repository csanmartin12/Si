const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ruleta-app";

const conectarDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB conectado");
  } catch (error) {
    console.error("Error conectandose a MongoDB:", error.message);
    process.exit(1);
  }
};


const esquemaUsuario = new mongoose.Schema({
  nombreUsuario: { type: String, required: true, unique: true, trim: true },
  nombreCompleto: { type: String, required: true, trim: true },
  correo: { type: String, required: true, unique: true, trim: true },
  fechaNacimiento: { type: Date, required: true },
  contrasenaHash: { type: String, required: true },
  saldo: { type: Number, default: 0, min: 0 },
  creadoEn: { type: Date, default: Date.now },
});


const esquemaTransaccion = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  tipo: { type: String, enum: ["deposito", "retiro"], required: true },
  monto: { type: Number, required: true, min: 1 },
  creadoEn: { type: Date, default: Date.now },
});


const esquemaPartida = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  numeroGanador: { type: Number, required: true, min: 0, max: 36 },
  apuestas: [
    {
      tipo: { type: String, required: true }, 
      valor: { type: Number }, 
      monto: { type: Number, required: true, min: 1 },
      gano: { type: Boolean, required: true },
      pago: { type: Number, required: true },      
      cambioNeto: { type: Number, required: true } 
    },
  ],
  cambioNetoTotal: { type: Number, required: true },
  creadoEn: { type: Date, default: Date.now },
});

const Usuario = mongoose.model("Usuario", esquemaUsuario);
const Transaccion = mongoose.model("Transaccion", esquemaTransaccion);
const Partida = mongoose.model("Partida", esquemaPartida);

module.exports = {
  conectarDB,
  Usuario,
  Transaccion,
  Partida,
};
