
# StaffGrid

StaffGrid is a lightweight web application for **shift scheduling**, **employee availability**, and **time-off management** for small teams and workplaces.

The system supports **3 user roles**:

- **OWNER** – full admin control (users, departments, employees, schedule, time-off approvals)
- **MANAGER** – department/employee management, schedule editing, time-off approval
- **EMPLOYEE** – personal portal (my schedule, my availability, my time-off)

---

## Features

### 🔐 Authentication & Roles

- Login with email/password  
- JWT stored as **HTTP-only cookie**  
- Role-based access control:  
  - OWNER / MANAGER → admin dashboard & tools  
  - EMPLOYEE → employee portal only  

---

## 👑 Admin Area (Owner / Manager)

### Dashboard
Simple overview showing:
- User’s name & role
- Direct links to Users, Departments, Employees, Schedule, Time Off Requests

### Users
- List of system users:
  - Name
  - Email
  - Role
  - Created date
- Create new users (OWNER / MANAGER / EMPLOYEE)
- MUI table + modal forms

### Departments
- Full CRUD
- Department name + description
- Clean MUI table with edit/delete actions

### Employees
- Connects a User (EMPLOYEE) to:
  - Department
  - Position
  - Weekly contract hours
- Searchable list (name, email, department, etc.)
- Modal-based create/edit form

### Schedule (Admin)
**Week view** (default):
- Navigation: Prev / Today / Next (shared `WeekNav` component)
- Department dropdown filter
- Daily cards showing all shifts for the day
- Notes & sorting by start time

**Shift creation/editing**
- Modal (`ShiftFormModal`) with:
  - Department
  - Date
  - Start / End time (validation: end > start)
  - Notes

**Assign employees**
- Modal (`AssignModal`)
- Add/remove employees from a shift
- Displays current assignees

### Time Off Admin
- List of all time-off requests across the company
- Filters:
  - Status (PENDING / APPROVED / DECLINED)
  - Date range (with overlap logic)
  - Department
  - Free-text search (name, email, reason)
- Actions:
  - Approve / Decline (with optional reason)
  - Delete (only PENDING)
- Role behavior:
  - EMPLOYEE: can modify only own PENDING requests  
  - MANAGER/OWNER: full control  

---

## 👤 Employee Portal

### My Schedule
- Weekly & Monthly views  
- Uses shared components: `WeekNav`, `MonthNav`, `ViewToggle`  
- **Week view**
  - Shows shifts assigned to the employee
- **Month view**
  - Calendar grid (`MyMonthGrid`)  
  - Shows all assigned shifts per day  

### My Time Off
- List of employee’s time-off requests
- Columns: type, dates, status, reason, created date
- Status badges (PENDING / APPROVED / DECLINED)
- Create/Edit/Delete:
  - Edit/Delete allowed only for **PENDING**
  - Modal form (`TimeOffFormModal`)
- Validation:
  - End date ≥ start date  
  - Valid type: VACATION / SICK / OTHER

### My Availability
- Weekly repeating availability setup
- Batch creation of multiple weekdays at once
- Preview of actual dates for the selected week
- Edit/Delete support
- Modal form (`AvailabilityFormModal`)

---

## Tech Stack

### Backend
- Node.js  
- Express  
- MongoDB + Mongoose  
- JWT authentication (HTTP-only cookie)
- Access control middleware for roles  
- Clean REST API structure  

### Frontend
- React + Vite  
- React Router  
- Axios for API communication  
- Material UI (MUI) for theming and components  
- Custom date utilities (`utils/date.js`)  
- Reusable components for navigation and modals  

---

## Getting Started

### 1. Prerequisites
- Node.js (LTS recommended)
- npm or yarn
- MongoDB instance (local or remote)

---

### 2.Setup

- Both front end and back end start with the same command : "npm run dev"



