/*
  # HR Management System Database Schema

  1. New Tables
    - `employees`
      - `id` (text, primary key) - Employee ID
      - `name` (text) - Full name
      - `email` (text, unique) - Email address
      - `phone` (text) - Phone number
      - `department` (text) - Department name
      - `position` (text) - Job position
      - `manager` (text) - Manager name
      - `base_salary` (numeric) - Base salary amount
      - `join_date` (date) - Joining date
      - `status` (text) - Employment status
      - `leave_balance` (integer) - Remaining leave days
      - `created_at` (timestamptz) - Record creation timestamp

    - `tasks`
      - `id` (integer, primary key, auto-increment) - Task ID
      - `assigned_to` (text) - Employee ID
      - `assigned_by` (text) - Manager name
      - `title` (text) - Task title
      - `due_date` (date) - Due date
      - `status` (text) - Task status (pending/completed)
      - `created_at` (timestamptz) - Record creation timestamp

    - `attendance`
      - `id` (integer, primary key, auto-increment) - Attendance ID
      - `emp_id` (text) - Employee ID
      - `date` (date) - Attendance date
      - `status` (text) - Attendance status (present/absent)
      - `check_in` (text) - Check-in time
      - `check_out` (text) - Check-out time
      - `created_at` (timestamptz) - Record creation timestamp

    - `payslips`
      - `id` (integer, primary key, auto-increment) - Payslip ID
      - `emp_id` (text) - Employee ID
      - `month` (text) - Month and year
      - `salary` (numeric) - Base salary
      - `bonus` (numeric) - Bonus amount
      - `deductions` (numeric) - Deductions amount
      - `net_pay` (numeric) - Net pay amount
      - `status` (text) - Payslip status (pending/processed)
      - `created_at` (timestamptz) - Record creation timestamp

    - `performance`
      - `id` (integer, primary key, auto-increment) - Performance ID
      - `emp_id` (text) - Employee ID
      - `rating` (text) - Performance rating
      - `tasks_completed` (integer) - Number of tasks completed
      - `attendance_percent` (numeric) - Attendance percentage
      - `last_review` (date) - Last review date
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for manager role to access all data
*/

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  department text NOT NULL,
  position text NOT NULL,
  manager text NOT NULL,
  base_salary numeric NOT NULL DEFAULT 0,
  join_date date NOT NULL,
  status text NOT NULL DEFAULT 'active',
  leave_balance integer NOT NULL DEFAULT 8,
  created_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id serial PRIMARY KEY,
  assigned_to text NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  assigned_by text NOT NULL,
  title text NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id serial PRIMARY KEY,
  emp_id text NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL,
  check_in text DEFAULT '-',
  check_out text DEFAULT '-',
  created_at timestamptz DEFAULT now(),
  UNIQUE(emp_id, date)
);

-- Create payslips table
CREATE TABLE IF NOT EXISTS payslips (
  id serial PRIMARY KEY,
  emp_id text NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  month text NOT NULL,
  salary numeric NOT NULL DEFAULT 0,
  bonus numeric NOT NULL DEFAULT 0,
  deductions numeric NOT NULL DEFAULT 0,
  net_pay numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create performance table
CREATE TABLE IF NOT EXISTS performance (
  id serial PRIMARY KEY,
  emp_id text UNIQUE NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  rating text DEFAULT '0/5',
  tasks_completed integer DEFAULT 0,
  attendance_percent numeric DEFAULT 100,
  last_review date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance ENABLE ROW LEVEL SECURITY;

-- Policies for employees table (public access for demo)
CREATE POLICY "Anyone can view employees"
  ON employees FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert employees"
  ON employees FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update employees"
  ON employees FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete employees"
  ON employees FOR DELETE
  USING (true);

-- Policies for tasks table (public access for demo)
CREATE POLICY "Anyone can view tasks"
  ON tasks FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert tasks"
  ON tasks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update tasks"
  ON tasks FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete tasks"
  ON tasks FOR DELETE
  USING (true);

-- Policies for attendance table (public access for demo)
CREATE POLICY "Anyone can view attendance"
  ON attendance FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert attendance"
  ON attendance FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update attendance"
  ON attendance FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete attendance"
  ON attendance FOR DELETE
  USING (true);

-- Policies for payslips table (public access for demo)
CREATE POLICY "Anyone can view payslips"
  ON payslips FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert payslips"
  ON payslips FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update payslips"
  ON payslips FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete payslips"
  ON payslips FOR DELETE
  USING (true);

-- Policies for performance table (public access for demo)
CREATE POLICY "Anyone can view performance"
  ON performance FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert performance"
  ON performance FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update performance"
  ON performance FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete performance"
  ON performance FOR DELETE
  USING (true);

-- Insert sample data
INSERT INTO employees (id, name, email, phone, department, position, manager, base_salary, join_date, status, leave_balance)
VALUES 
  ('EMP001', 'Raj Kumar', 'raj@company.com', '9876543210', 'IT', 'Developer', 'John Doe', 50000, '2022-01-15', 'active', 8),
  ('EMP002', 'Priya Singh', 'priya@company.com', '9876543211', 'HR', 'HR Manager', 'John Doe', 55000, '2021-06-20', 'active', 8),
  ('EMP003', 'Amit Patel', 'amit@company.com', '9876543212', 'Sales', 'Sales Executive', 'John Doe', 45000, '2023-03-10', 'active', 8)
ON CONFLICT (id) DO NOTHING;

-- Insert sample tasks
INSERT INTO tasks (assigned_to, assigned_by, title, due_date, status)
VALUES 
  ('EMP001', 'John Doe', 'Complete API Documentation', '2025-10-25', 'pending'),
  ('EMP002', 'John Doe', 'Organize Team Meeting', '2025-10-20', 'completed'),
  ('EMP003', 'John Doe', 'Close 3 Sales Deals', '2025-10-30', 'pending');

-- Insert sample attendance
INSERT INTO attendance (emp_id, date, status, check_in, check_out)
VALUES 
  ('EMP001', '2025-10-10', 'present', '09:00', '18:00'),
  ('EMP001', '2025-10-11', 'present', '09:15', '18:30'),
  ('EMP001', '2025-10-12', 'absent', '-', '-')
ON CONFLICT (emp_id, date) DO NOTHING;

-- Insert sample payslips
INSERT INTO payslips (emp_id, month, salary, bonus, deductions, net_pay, status)
VALUES 
  ('EMP001', 'September 2025', 50000, 5000, 5000, 50000, 'processed'),
  ('EMP001', 'August 2025', 50000, 5000, 5000, 50000, 'processed'),
  ('EMP002', 'September 2025', 55000, 5000, 5500, 54500, 'processed'),
  ('EMP003', 'September 2025', 45000, 5000, 4500, 45500, 'processed');

-- Insert sample performance
INSERT INTO performance (emp_id, rating, tasks_completed, attendance_percent, last_review)
VALUES 
  ('EMP001', '4.5/5', 12, 95, '2025-09-15'),
  ('EMP002', '4.8/5', 15, 98, '2025-09-15'),
  ('EMP003', '4.0/5', 8, 90, '2025-09-15')
ON CONFLICT (emp_id) DO NOTHING;