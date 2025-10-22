const { body, param, query } = require("express-validator");

const idParam = param("id").isMongoId().withMessage("Invalid time-off id");
const isYMD = v => /^\d{4}-\d{2}-\d{2}$/.test(v); // κρατάμε YYYY-MM-DD (χωρίς toDate)

const createTimeOffValidator = [
  body("employee").optional({ nullable: true }).custom((val, { req }) => {
    if (req.user?.role === "EMPLOYEE" && val) {
      throw new Error("Employees cannot set employee");
    }
    if (val && !/^[a-f\d]{24}$/i.test(val)) throw new Error("Invalid employee id");
    return true;
  }),
  body("status").optional({ nullable: true }).custom((val, { req }) => {
    if (req.user?.role === "EMPLOYEE" && val) throw new Error("Employees cannot set status");
    const allowed = ["PENDING","APPROVED","DECLINED"];
    if (val && !allowed.includes(val)) throw new Error("Invalid status");
    return true;
  }),
  body("type").isIn(["VACATION","SICK","OTHER"]).withMessage("Invalid type"),
  body("startDate").custom(isYMD).withMessage("Invalid startDate (YYYY-MM-DD)"),
  body("endDate").custom(isYMD).withMessage("Invalid endDate (YYYY-MM-DD)"),
  body().custom((_, { req }) => {
    const { startDate, endDate } = req.body;
    if (isYMD(startDate) && isYMD(endDate) && endDate < startDate) {
      throw new Error("endDate must be on/after startDate");
    }
    if (req.user?.role !== "EMPLOYEE" && !req.body.employee) {
      throw new Error("employee is required");
    }
    return true;
  }),
];

const updateTimeOffValidator = [
  idParam,
  body("employee").optional({ nullable: true }).custom((val, { req }) => {
    if (req.user?.role === "EMPLOYEE" && val) throw new Error("Employees cannot change employee");
    if (val && !/^[a-f\d]{24}$/i.test(val)) throw new Error("Invalid employee id");
    return true;
  }),
  body("status").optional({ nullable: true }).custom((val, { req }) => {
    const allowed = ["PENDING","APPROVED","DECLINED"];
    if (req.user?.role === "EMPLOYEE" && val) throw new Error("Employees cannot change status");
    if (val && !allowed.includes(val)) throw new Error("Invalid status");
    return true;
  }),
  body("type").optional().isIn(["VACATION","SICK","OTHER"]),
  body("startDate").optional().custom(isYMD).withMessage("Invalid startDate (YYYY-MM-DD)"),
  body("endDate").optional().custom(isYMD).withMessage("Invalid endDate (YYYY-MM-DD)"),
  body().custom((_, { req }) => {
    const { startDate, endDate } = req.body;
    if (startDate && endDate && endDate < startDate) {
      throw new Error("endDate must be on/after startDate");
    }
    return true;
  }),
];

const timeOffIdParam = [ idParam ];
const timeOffListQuery = [
  query("employee").optional().isMongoId(),
  query("status").optional().isIn(["PENDING","APPROVED","DECLINED"]),
  query("from").optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("from must be YYYY-MM-DD"),
  query("to").optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("to must be YYYY-MM-DD"),
];

module.exports = {
  createTimeOffValidator,
  updateTimeOffValidator,
  timeOffIdParam,
  timeOffListQuery
};
