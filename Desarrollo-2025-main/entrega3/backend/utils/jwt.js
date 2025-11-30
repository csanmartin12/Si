// backend/utils/jwt.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "cambia-este-secreto";
const TEN_MINUTES_MS = 10 * 60 * 1000;

function generateToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      username: user.username
    },
    JWT_SECRET,
    { expiresIn: "10m" } // 10 minutos requeridos
  );
}

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("session", token, {
    httpOnly: true,
    secure: isProd,         
    sameSite: "strict",
    maxAge: TEN_MINUTES_MS
  });
}

function clearAuthCookie(res) {
  res.clearCookie("session");
}


function authRequired(req, res, next) {
  const token = req.cookies?.session;
  if (!token) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = payload; 
    next();
  } catch (err) {
    console.error("Error verificando JWT:", err);
    return res.status(401).json({ error: "Sesión inválida o expirada" });
  }
}

module.exports = {
  generateToken,
  setAuthCookie,
  clearAuthCookie,
  authRequired
};
