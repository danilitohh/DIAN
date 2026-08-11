// Autenticación JWT y almacenamiento sencillo de usuarios.
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const file = path.join(__dirname, 'users.json');
function login(user, pass) {
  const found = JSON.parse(fs.readFileSync(file, 'utf8')).find(u => u.user === user);
  if (!found || !bcrypt.compareSync(pass, found.passHash)) throw new Error('Usuario o contraseña incorrectos');
  return jwt.sign({ user }, process.env.JWT_SECRET || 'supersecretkey123', { expiresIn: '8h' });
}
function protect(req, res, next) {
  try { const token = (req.headers.authorization || '').replace('Bearer ', ''); if (!token) throw new Error('Token requerido'); req.auth = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123'); next(); }
  catch (e) { res.status(401).json({ error: 'Sesión no válida o expirada' }); }
}
module.exports = { login, protect };
