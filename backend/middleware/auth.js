const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verifies JWT and attaches decoded user to req.user
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, email }
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
}

// Restricts route access to specific roles
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions.' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
