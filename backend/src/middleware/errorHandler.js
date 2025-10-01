// Κεντρικός χειρισμός λαθών + 404 fallback

function notFound(req, res, next) {
  const err = new Error(`Not Found - ${req.originalUrl}`);
  err.status = 404;
  next(err);
}

function errorHandler(err, req, res, _next) {
  // Προσπάθεια να βγάλουμε HTTP status
  const status =
    err.status ||
    err.statusCode ||
    (err.name === "ValidationError" ? 400 : 500);

  // Mongoose CastError (π.χ. λάθος ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Validation error",
      details: [{ field: err.path, msg: "Invalid identifier" }]
    });
  }

  // Mongo duplicate key (E11000)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyPattern || {});
    return res.status(409).json({
      message: "Conflict",
      details: fields.map(f => ({ field: f, msg: "Already exists" }))
    });
  }

  // express-validator (αν φτάσει εδώ χωρίς να έχει κοπεί από validate middleware)
  if (Array.isArray(err.errors)) {
    return res.status(400).json({
      message: "Validation error",
      details: err.errors.map(e => ({ field: e.param, msg: e.msg }))
    });
  }

  // Γενικός χειρισμός
  const payload = { message: err.message || "Server error" };

  // Σε dev δείξε λίγα παραπάνω
  if (process.env.NODE_ENV !== "production") {
    payload.stack = err.stack;
  }

  return res.status(status).json(payload);
}

module.exports = { notFound, errorHandler };
