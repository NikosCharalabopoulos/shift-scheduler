// backend/src/index.js
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");


// φορτώνουμε μεταβλητές από .env
dotenv.config();

const app = express();

// middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/usersRoutes"));
app.use("/api/departments", require("./routes/departmentsRoutes"));
app.use("/api/employees", require("./routes/employeesRoutes"));
app.use("/api/availability", require("./routes/availabilityRoutes"));
app.use("/api/timeoff", require("./routes/timeOffRoutes"));
app.use("/api/shifts", require("./routes/shiftsRoutes"));
app.use("/api/shift-assignments", require("./routes/shiftAssignmentsRoutes"));

const { notFound, errorHandler } = require("./middleware/errorHandler");
app.use(notFound);
app.use(errorHandler);

// start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 API running on http://localhost:${PORT}`);
  });
});
