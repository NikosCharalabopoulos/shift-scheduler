// backend/src/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const COOKIE_NAME = "sg_token";

const isProd = process.env.NODE_ENV === "production";
const cookieOpts = {
  httpOnly: true,
  sameSite: isProd ? "none" : "lax",
  secure: isProd,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

function signToken(payload, expiresIn = "7d") {
  const secret = process.env.JWT_SECRET;
  return jwt.sign(payload, secret, { expiresIn });
}

function getTokenFromReq(req) {
  const fromCookie = req.cookies?.[COOKIE_NAME];
  const fromHeader =
    req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;
  return fromCookie || fromHeader || null;
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const { fullName, email, password, role } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, passwordHash, role });

    const token = signToken({ uid: user._id, role: user.role });
    res
      .cookie(COOKIE_NAME, token, cookieOpts)
      .status(201)
      .json({ user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering user", error });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing required fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken({ uid: user._id, role: user.role });
    res
      .cookie(COOKIE_NAME, token, cookieOpts)
      .json({ user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in", error });
  }
}

// POST /api/auth/logout
function logout(_req, res) {
  res.clearCookie(COOKIE_NAME, { path: "/" }).json({ ok: true });
}

// GET /api/auth/me
async function me(req, res) {
  try {
    const token = getTokenFromReq(req);
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.uid).select("-passwordHash");
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    res.json({ user });
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = { register, login, logout, me, COOKIE_NAME };
