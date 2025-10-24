// backend/src/middleware/selfScope.js
function isEmployee(req) {
  return req.user && req.user.role === "EMPLOYEE";
}

// Αν ο χρήστης είναι EMPLOYEE, επιβάλλει employeeId στο body
function enforceSelfOnBody(field = "employee") {
  return (req, _res, next) => {
    if (isEmployee(req)) {
      req.body = req.body || {};
      req.body[field] = req.user.id; // override οτιδήποτε ήρθε από τον client
      // EMPLOYEE δεν μπορεί να ορίσει status κ.λπ. – καθάρισέ τα αν υπάρχουν
      if ("status" in req.body) delete req.body.status;
    }
    next();
  };
}

// Αν ο χρήστης είναι EMPLOYEE, φιλτράρει query με το δικό του employeeId
function enforceSelfOnQuery(field = "employee") {
  return (req, _res, next) => {
    if (isEmployee(req)) {
      req.query = req.query || {};
      req.query[field] = req.user.id;
    }
    next();
  };
}

/**
 * Για update/delete σε resource που “ανήκει” σε κάποιο employee,
 * δώσε resolver που επιστρέφει το owner employeeId (string ή ObjectId).
 */
function forbidMutatingForeignResource(getOwnerId) {
  return async (req, res, next) => {
    try {
      if (!isEmployee(req)) return next();
      const ownerId = await getOwnerId(req);
      if (ownerId && String(ownerId) !== String(req.user.id)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { enforceSelfOnBody, enforceSelfOnQuery, forbidMutatingForeignResource };
