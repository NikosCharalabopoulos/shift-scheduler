const jwt = require("jsonwebtoken");
const { COOKIE_NAME } = require("../controllers/authController");

// Ελέγχει ότι υπάρχει έγκυρο JWT (cookie ή Authorization) και βάζει req.user = { id, role }
function auth(req, res, next) {
  try {
    const cookieToken = req.cookies?.[COOKIE_NAME];
    const headerToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;

    const token = cookieToken || headerToken;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.uid, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

// Επιτρέπει πρόσβαση μόνο αν ο ρόλος του χρήστη είναι μέσα στη λίστα
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

module.exports = { auth, requireRole };
