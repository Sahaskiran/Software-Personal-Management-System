import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  manager: string;
  base_salary: number;
  join_date: string;
  status: string;
  leave_balance: number;
  created_at?: string;
}

export interface Task {
  id: number;
  assigned_to: string;
  assigned_by: string;
  title: string;
  due_date: string;
  status: string;
  created_at?: string;
}

export interface Attendance {
  id: number;
  emp_id: string;
  date: string;
  status: string;
  check_in: string;
  check_out: string;
  created_at?: string;
}

export interface Payslip {
  id: number;
  emp_id: string;
  month: string;
  salary: number;
  bonus: number;
  deductions: number;
  net_pay: number;
  status: string;
  created_at?: string;
}

export interface Performance {
  id: number;
  emp_id: string;
  rating: string;
  tasks_completed: number;
  attendance_percent: number;
  last_review: string;
  created_at?: string;
  updated_at?: string;
}
