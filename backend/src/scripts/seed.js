require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Μοντέλα (χρησιμοποίησε ΤΑ ΔΙΚΑ ΣΟΥ paths/ονόματα αρχείων)
const User = require("../models/userModel");
const Department = require("../models/departmentModel");
const Employee = require("../models/employeeModel");
const Availability = require("../models/availabilityModel");
const TimeOff = require("../models/timeOffModel");
const Shift = require("../models/shiftModel");
const ShiftAssignment = require("../models/shiftAssignmentModel");

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("Missing MONGO_URI");
  await mongoose.connect(uri);

  console.log("⚠️  Dropping existing collections (if any)...");
  await Promise.allSettled([
    User.deleteMany({}),
    Department.deleteMany({}),
    Employee.deleteMany({}),
    Availability.deleteMany({}),
    TimeOff.deleteMany({}),
    Shift.deleteMany({}),
    ShiftAssignment.deleteMany({})
  ]);

  console.log("👤 Creating users (OWNER + 2 EMPLOYEES)...");
  const owner = await User.create({
    fullName: "Owner User",
    email: "owner@example.com",
    passwordHash: await bcrypt.hash("pass1234", 10),
    role: "OWNER"
  });

  const empUser1 = await User.create({
    fullName: "Nikos Georgiou",
    email: "nikos@example.com",
    passwordHash: await bcrypt.hash("pass1234", 10),
    role: "EMPLOYEE"
  });

  const empUser2 = await User.create({
    fullName: "Maria Papadopoulou",
    email: "maria@example.com",
    passwordHash: await bcrypt.hash("pass1234", 10),
    role: "EMPLOYEE"
  });

  console.log("🏷️  Creating department...");
  const dept = await Department.create({
    name: "Front Desk",
    description: "Reception"
  });

  console.log("👔 Creating employees...");
  const emp1 = await Employee.create({
    user: empUser1._id,
    department: dept._id,
    position: "Agent",
    contractHours: 40
  });

  const emp2 = await Employee.create({
    user: empUser2._id,
    department: dept._id,
    position: "Cashier",
    contractHours: 35
  });

  console.log("🗓️  Availability for both (Tuesday 10:00–18:00)...");
  await Availability.create([
    { employee: emp1._id, weekday: 2, startTime: "10:00", endTime: "18:00" },
    { employee: emp2._id, weekday: 2, startTime: "10:00", endTime: "18:00" }
  ]);

  console.log("🧾 Approved time-off for emp1 (2025-10-05..07)...");
  await TimeOff.create({
    employee: emp1._id,
    type: "VACATION",
    startDate: new Date("2025-10-05"),
    endDate: new Date("2025-10-07"),
    status: "APPROVED",
    reason: "Trip"
  });

  console.log("🕘 Creating a couple of shifts...");
  const shiftA = await Shift.create({
    department: dept._id,
    date: new Date("2025-10-06"), // μέσα στο time-off του emp1
    startTime: "09:00",
    endTime: "17:00",
    notes: "Time-off conflict test"
  });

  const shiftB = await Shift.create({
    department: dept._id,
    date: new Date("2025-10-08"),
    startTime: "09:00",
    endTime: "13:00",
    notes: "Overlap A"
  });

  const shiftC = await Shift.create({
    department: dept._id,
    date: new Date("2025-10-08"),
    startTime: "12:00",
    endTime: "16:00",
    notes: "Overlap B"
  });

  console.log("✅ Seed done.\n");
  console.log("== Useful IDs ==");
  console.log({ 
    ownerUserId: owner._id.toString(),
    deptId: dept._id.toString(),
    emp1UserId: empUser1._id.toString(),
    emp2UserId: empUser2._id.toString(),
    emp1Id: emp1._id.toString(),
    emp2Id: emp2._id.toString(),
    shiftAId: shiftA._id.toString(),
    shiftBId: shiftB._id.toString(),
    shiftCId: shiftC._id.toString()
  });

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
