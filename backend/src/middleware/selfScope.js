// backend/src/middleware/selfScope.js

function isEmployee(req) {
  return req.user && req.user.role === "EMPLOYEE";
}

// EMPLOYEE → επιβάλλει owner στο body (employeeId)
function enforceSelfOnBody(field = "employee") {
  return (req, res, next) => {
    if (!isEmployee(req)) return next();

    if (!req.employeeId) {
      return res.status(403).json({ message: "No employee profile" });
    }

    req.body = req.body || {};
    req.body[field] = req.employeeId; // ✅ employeeId, όχι userId

    // Ο EMPLOYEE δεν μπορεί να ορίσει status (π.χ. time-off)
    if ("status" in req.body) delete req.body.status;

    next();
  };
}

// EMPLOYEE → φιλτράρει query στον εαυτό του (employeeId)
function enforceSelfOnQuery(field = "employee") {
  return (req, res, next) => {
    if (!isEmployee(req)) return next();

    if (!req.employeeId) {
      return res.status(403).json({ message: "No employee profile" });
    }

    req.query = req.query || {};
    req.query[field] = req.employeeId; // ✅ employeeId

    next();
  };
}

/**
 * Γενικός φραγμός για update/delete σε resource που “ανήκει” σε employee.
 * getOwnerId(req) πρέπει να επιστρέφει το employeeId του resource.
 */
function forbidMutatingForeignResource(getOwnerId) {
  return async (req, res, next) => {
    try {
      if (!isEmployee(req)) return next();

      if (!req.employeeId) {
        return res.status(403).json({ message: "No employee profile" });
      }

      const ownerId = await getOwnerId(req); // αναμένουμε employeeId
      if (ownerId && String(ownerId) !== String(req.employeeId)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { enforceSelfOnBody, enforceSelfOnQuery, forbidMutatingForeignResource };
