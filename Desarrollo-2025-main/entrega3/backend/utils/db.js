const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ruleta-app';


const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB conectado exitosamente');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};


const userSchema = new mongoose.Schema({
  nombreCompleto: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  fechaNacimiento: {
    type: Date,
    required: true
  },
  saldo: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


const transaccionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tipo: {
    type: String,
    enum: ['deposito', 'retiro'],
    required: true
  },
  monto: {
    type: Number,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});


const partidaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  apuestas: [{
    tipo: String,
    valor: mongoose.Schema.Types.Mixed, 
    monto: Number
  }],
  numeroGanador: {
    type: Number,
    required: true
  },
  ganancia: {
    type: Number,
    default: 0
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);
const Transaccion = mongoose.model('Transaccion', transaccionSchema);
const Partida = mongoose.model('Partida', partidaSchema);

module.exports = {
  connectDB,
  User,
  Transaccion,
  Partida
};