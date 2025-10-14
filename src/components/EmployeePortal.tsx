import { useState, useEffect } from 'react';
import { supabase, Employee, Task, Attendance, Payslip, Performance } from '../lib/supabase';

interface EmployeePortalProps {
  empId: string;
  onLogout: () => void;
}

export default function EmployeePortal({ empId, onLogout }: EmployeePortalProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [performance, setPerformance] = useState<Performance | null>(null);

  useEffect(() => {
    loadEmployeeData();

    // Set up real-time subscriptions
    const tasksSubscription = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `assigned_to=eq.${empId}` }, () => {
        loadTasks();
      })
      .subscribe();

    const payslipsSubscription = supabase
      .channel('payslips-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payslips', filter: `emp_id=eq.${empId}` }, () => {
        loadPayslips();
      })
      .subscribe();

    const performanceSubscription = supabase
      .channel('performance-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'performance', filter: `emp_id=eq.${empId}` }, () => {
        loadPerformance();
      })
      .subscribe();

    return () => {
      tasksSubscription.unsubscribe();
      payslipsSubscription.unsubscribe();
      performanceSubscription.unsubscribe();
    };
  }, [empId]);

  const loadEmployeeData = async () => {
    await Promise.all([
      loadEmployee(),
      loadTasks(),
      loadAttendance(),
      loadPayslips(),
      loadPerformance(),
    ]);
  };

  const loadEmployee = async () => {
    const { data } = await supabase
      .from('employees')
      .select('*')
      .eq('id', empId)
      .maybeSingle();
    if (data) setEmployee(data);
  };

  const loadTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', empId)
      .order('due_date', { ascending: true });
    if (data) setTasks(data);
  };

  const loadAttendance = async () => {
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('emp_id', empId)
      .order('date', { ascending: false })
      .limit(10);
    if (data) setAttendance(data);
  };

  const loadPayslips = async () => {
    const { data } = await supabase
      .from('payslips')
      .select('*')
      .eq('emp_id', empId)
      .order('created_at', { ascending: false });
    if (data) setPayslips(data);
  };

  const loadPerformance = async () => {
    const { data } = await supabase
      .from('performance')
      .select('*')
      .eq('emp_id', empId)
      .maybeSingle();
    if (data) setPerformance(data);
  };

  const updateTaskStatus = async (taskId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId);

    if (!error) {
      alert(`Task marked as ${newStatus}`);
      loadTasks();
    }
  };

  const pendingTasksCount = tasks.filter(t => t.status === 'pending').length;
  const presentDaysCount = attendance.filter(a => a.status === 'present').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 mb-8 rounded-lg mx-6 mt-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Employee Dashboard</h2>
          <p className="text-sm mt-1">Welcome, {employee?.name}!</p>
        </div>
        <button
          onClick={onLogout}
          className="bg-white bg-opacity-20 border-2 border-white px-4 py-2 rounded-lg font-semibold hover:bg-opacity-30 transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="px-6">
        <div className="flex gap-3 mb-6 flex-wrap">
          {['dashboard', 'tasks', 'attendance', 'payslip', 'profile'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-blue-100 border-2 border-blue-600 text-blue-700'
                  : 'bg-white border-2 border-gray-300 hover:border-gray-400'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-600">
              <h3 className="font-semibold mb-2">Pending Tasks</h3>
              <p className="text-4xl font-bold text-blue-600 my-3">{pendingTasksCount}</p>
              <p className="text-gray-600 text-sm">Tasks assigned to you</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-600">
              <h3 className="font-semibold mb-2">Attendance</h3>
              <p className="text-4xl font-bold text-blue-600 my-3">{presentDaysCount}</p>
              <p className="text-gray-600 text-sm">Days present this month</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-600">
              <h3 className="font-semibold mb-2">Leave Balance</h3>
              <p className="text-4xl font-bold text-blue-600 my-3">{employee?.leave_balance || 0}</p>
              <p className="text-gray-600 text-sm">Remaining leave days</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-600">
              <h3 className="font-semibold mb-2">Performance</h3>
              <p className="text-4xl font-bold text-blue-600 my-3">{performance?.rating || '-'}</p>
              <p className="text-gray-600 text-sm">Current rating</p>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">My Tasks</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="text-left p-3 font-semibold">Task</th>
                    <th className="text-left p-3 font-semibold">Assigned By</th>
                    <th className="text-left p-3 font-semibold">Due Date</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                    <th className="text-left p-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-6 text-gray-500">
                        No tasks assigned
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <tr key={task.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{task.title}</td>
                        <td className="p-3">{task.assigned_by}</td>
                        <td className="p-3">{task.due_date}</td>
                        <td className="p-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              task.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => updateTaskStatus(task.id, task.status)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
                          >
                            Mark {task.status === 'completed' ? 'Pending' : 'Complete'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Attendance Record</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="text-left p-3 font-semibold">Date</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                    <th className="text-left p-3 font-semibold">Check-in</th>
                    <th className="text-left p-3 font-semibold">Check-out</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{record.date}</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            record.status === 'present'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-3">{record.check_in}</td>
                      <td className="p-3">{record.check_out}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'payslip' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Payslips</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="text-left p-3 font-semibold">Month</th>
                    <th className="text-left p-3 font-semibold">Salary</th>
                    <th className="text-left p-3 font-semibold">Bonus</th>
                    <th className="text-left p-3 font-semibold">Deductions</th>
                    <th className="text-left p-3 font-semibold">Net Pay</th>
                    <th className="text-left p-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payslips.map((payslip) => (
                    <tr key={payslip.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{payslip.month}</td>
                      <td className="p-3">₹{payslip.salary.toLocaleString()}</td>
                      <td className="p-3">₹{payslip.bonus.toLocaleString()}</td>
                      <td className="p-3">₹{payslip.deductions.toLocaleString()}</td>
                      <td className="p-3 font-bold">₹{payslip.net_pay.toLocaleString()}</td>
                      <td className="p-3">
                        <button
                          onClick={() => alert(`Downloading payslip for ${payslip.month}`)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'profile' && employee && (
          <div className="bg-white p-6 rounded-lg shadow max-w-3xl">
            <h3 className="text-xl font-semibold mb-6">My Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-xs text-gray-600 block mb-1">Name</label>
                <div className="font-semibold text-lg">{employee.name}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-xs text-gray-600 block mb-1">Employee ID</label>
                <div className="font-semibold text-lg">{employee.id}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-xs text-gray-600 block mb-1">Department</label>
                <div className="font-semibold text-lg">{employee.department}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-xs text-gray-600 block mb-1">Position</label>
                <div className="font-semibold text-lg">{employee.position}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-xs text-gray-600 block mb-1">Email</label>
                <div className="font-semibold text-lg">{employee.email}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-xs text-gray-600 block mb-1">Phone</label>
                <div className="font-semibold text-lg">{employee.phone}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-xs text-gray-600 block mb-1">Joining Date</label>
                <div className="font-semibold text-lg">{employee.join_date}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-xs text-gray-600 block mb-1">Manager</label>
                <div className="font-semibold text-lg">{employee.manager}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
