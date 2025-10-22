const { body, param, query } = require("express-validator");

const timeHHmm = v => /^\d{2}:\d{2}$/.test(v);
const isWeekday = n => Number.isInteger(n) && n >= 0 && n <= 6;

const idParam = param("id").isMongoId().withMessage("Invalid availability id");
const employeeQ = query("employee").optional().isMongoId().withMessage("Invalid employee id");

const createAvailabilityValidator = [
  // EMPLOYEE: δεν επιτρέπεται να ορίσει employee (μπαίνει server-side)
  // MANAGER/OWNER: μπορούν να ορίσουν employee (αν δοθεί πρέπει να είναι ObjectId)
  body("employee").optional({ nullable: true }).custom((val, { req }) => {
    if (req.user?.role === "EMPLOYEE" && val) {
      throw new Error("Employees cannot set employee");
    }
    if (val && !/^[a-f\d]{24}$/i.test(val)) throw new Error("Invalid employee id");
    return true;
  }),
  body("weekday").exists().withMessage("weekday is required")
    .toInt().custom(isWeekday).withMessage("weekday must be 0..6"),
  body("startTime").exists().withMessage("startTime is required")
    .custom(timeHHmm).withMessage("startTime must be HH:mm"),
  body("endTime").exists().withMessage("endTime is required")
    .custom(timeHHmm).withMessage("endTime must be HH:mm"),
  body("endTime").custom((end, { req }) => {
    const [sh, sm] = String(req.body.startTime || "").split(":").map(Number);
    const [eh, em] = String(end || "").split(":").map(Number);
    if (Number.isNaN(sh) || Number.isNaN(eh)) return true;
    const s = sh * 60 + sm, e = eh * 60 + em;
    if (e <= s) throw new Error("endTime must be after startTime");
    return true;
  }),
];

const updateAvailabilityValidator = [
  idParam,
  body("employee").optional({ nullable: true }).custom((val, { req }) => {
    if (req.user?.role === "EMPLOYEE" && val) {
      throw new Error("Employees cannot change employee");
    }
    if (val && !/^[a-f\d]{24}$/i.test(val)) throw new Error("Invalid employee id");
    return true;
  }),
  body("weekday").optional().toInt().custom(isWeekday).withMessage("weekday must be 0..6"),
  body("startTime").optional().custom(timeHHmm).withMessage("startTime must be HH:mm"),
  body("endTime").optional().custom(timeHHmm).withMessage("endTime must be HH:mm"),
  body().custom((_, { req }) => {
    if (req.body.startTime || req.body.endTime) {
      const st = req.body.startTime || "00:00";
      const et = req.body.endTime || "23:59";
      const [sh, sm] = st.split(":").map(Number);
      const [eh, em] = et.split(":").map(Number);
      const s = sh * 60 + sm, e = eh * 60 + em;
      if (e <= s) throw new Error("endTime must be after startTime");
    }
    return true;
  }),
];

const availabilityIdParam = [ idParam ];
const availabilityListQuery = [ employeeQ ];

module.exports = {
  createAvailabilityValidator,
  updateAvailabilityValidator,
  availabilityIdParam,
  availabilityListQuery
};
