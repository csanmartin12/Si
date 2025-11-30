const jwt = require("jsonwebtoken");

const JWT_SECRETO = process.env.JWT_SECRETO || "secreto-muy-seguro";
const DURACION_TOKEN = "10m"; 

function crearToken(idUsuario) {
  return jwt.sign({ sub: idUsuario }, JWT_SECRETO, {
    expiresIn: DURACION_TOKEN,
  });
}

function authRequerida(req, res, next) {
  const token = req.cookies?.tokenSesion;
  if (!token) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRETO);
    req.idUsuario = payload.sub; 
    req.auth = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

module.exports = {
  crearToken,
  authRequerida,
};
