// backend/src/utils/getEmployeeIdForUser.js
const Employee = require("../models/employeeModel");

async function getEmployeeIdForUser(userId) {
  if (!userId) return null;
  const emp = await Employee.findOne({ user: userId }).select("_id");
  return emp ? String(emp._id) : null;
}

module.exports = { getEmployeeIdForUser };
