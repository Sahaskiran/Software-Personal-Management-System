import { useState, useEffect } from 'react';
import { supabase, Employee, Task, Payslip, Performance } from '../lib/supabase';
import { X, Pencil } from 'lucide-react';

interface ManagerPortalProps {
  onLogout: () => void;
}

export default function ManagerPortal({ onLogout }: ManagerPortalProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [performance, setPerformance] = useState<Performance[]>([]);

  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showEditEmployee, setShowEditEmployee] = useState(false);
  const [showAssignTask, setShowAssignTask] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    department: 'IT',
    position: '',
    baseSalary: 0,
    joinDate: '',
  });

  const [editEmployee, setEditEmployee] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    department: 'IT',
    position: '',
    baseSalary: 0,
    joinDate: '',
    leaveBalance: 8,
  });

  const [newTask, setNewTask] = useState({
    assignedTo: '',
    title: '',
    dueDate: '',
  });

  useEffect(() => {
    loadManagerData();
  }, []);

  const loadManagerData = async () => {
    await Promise.all([
      loadEmployees(),
      loadTasks(),
      loadPayslips(),
      loadPerformance(),
    ]);
  };

  const loadEmployees = async () => {
    const { data } = await supabase
      .from('employees')
      .select('*')
      .order('id', { ascending: true });
    if (data) setEmployees(data);
  };

  const loadTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true });
    if (data) setTasks(data);
  };

  const loadPayslips = async () => {
    const { data } = await supabase
      .from('payslips')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setPayslips(data);
  };

  const loadPerformance = async () => {
    const { data } = await supabase
      .from('performance')
      .select('*');
    if (data) setPerformance(data);
  };

  const addEmployee = async () => {
    if (!newEmployee.id || !newEmployee.name || !newEmployee.email || !newEmployee.phone || !newEmployee.position || !newEmployee.joinDate) {
      alert('Please fill all fields');
      return;
    }

    const { error: empError } = await supabase
      .from('employees')
      .insert({
        id: newEmployee.id,
        name: newEmployee.name,
        email: newEmployee.email,
        phone: newEmployee.phone,
        department: newEmployee.department,
        position: newEmployee.position,
        manager: 'John Doe',
        base_salary: newEmployee.baseSalary,
        join_date: newEmployee.joinDate,
        status: 'active',
        leave_balance: 8,
      });

    if (empError) {
      alert('Error adding employee: ' + empError.message);
      return;
    }

    await supabase
      .from('performance')
      .insert({
        emp_id: newEmployee.id,
        rating: '3.5/5',
        tasks_completed: 0,
        attendance_percent: 100,
        last_review: new Date().toISOString().split('T')[0],
      });

    alert('Employee added successfully!');
    setShowAddEmployee(false);
    setNewEmployee({
      id: '',
      name: '',
      email: '',
      phone: '',
      department: 'IT',
      position: '',
      baseSalary: 0,
      joinDate: '',
    });
    loadManagerData();
  };

  const openEditEmployee = (emp: Employee) => {
    setEditEmployee({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      position: emp.position,
      baseSalary: emp.base_salary,
      joinDate: emp.join_date,
      leaveBalance: emp.leave_balance,
    });
    setShowEditEmployee(true);
  };

  const updateEmployee = async () => {
    if (!editEmployee.name || !editEmployee.email || !editEmployee.phone || !editEmployee.position) {
      alert('Please fill all required fields');
      return;
    }

    const { error } = await supabase
      .from('employees')
      .update({
        name: editEmployee.name,
        email: editEmployee.email,
        phone: editEmployee.phone,
        department: editEmployee.department,
        position: editEmployee.position,
        base_salary: editEmployee.baseSalary,
        join_date: editEmployee.joinDate,
        leave_balance: editEmployee.leaveBalance,
      })
      .eq('id', editEmployee.id);

    if (error) {
      alert('Error updating employee: ' + error.message);
      return;
    }

    alert('Employee updated successfully!');
    setShowEditEmployee(false);
    loadManagerData();
  };

  const deleteEmployee = async (empId: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', empId);

    if (!error) {
      alert('Employee deleted successfully');
      loadManagerData();
    }
  };

  const assignTask = async () => {
    if (!newTask.assignedTo || !newTask.title || !newTask.dueDate) {
      alert('Please fill all fields');
      return;
    }

    const { error } = await supabase
      .from('tasks')
      .insert({
        assigned_to: newTask.assignedTo,
        assigned_by: 'John Doe',
        title: newTask.title,
        due_date: newTask.dueDate,
        status: 'pending',
      });

    if (!error) {
      alert('Task assigned successfully!');
      setShowAssignTask(false);
      setNewTask({ assignedTo: '', title: '', dueDate: '' });
      loadTasks();
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (!error) {
      alert('Task deleted');
      loadTasks();
    }
  };

  const processPayroll = async () => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    for (const emp of employees) {
      const bonus = 5000;
      const deductions = Math.floor(emp.base_salary * 0.1);
      const netPay = emp.base_salary + bonus - deductions;

      await supabase
        .from('payslips')
        .insert({
          emp_id: emp.id,
          month: currentMonth,
          salary: emp.base_salary,
          bonus: bonus,
          deductions: deductions,
          net_pay: netPay,
          status: 'processed',
        });
    }

    alert('Payroll processed successfully for all employees!');
    loadPayslips();
  };

  const presentToday = Math.floor(Math.random() * employees.length) + 1;
  const pendingTasksCount = tasks.filter(t => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 mb-8 rounded-lg mx-6 mt-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Manager Dashboard</h2>
          <p className="text-sm mt-1">Welcome</p>
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
          {['dashboard', 'employees', 'tasks', 'payroll', 'performance'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-purple-100 border-2 border-purple-600 text-purple-700'
                  : 'bg-white border-2 border-gray-300 hover:border-gray-400'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-600">
              <h3 className="font-semibold mb-2">Total Employees</h3>
              <p className="text-4xl font-bold text-purple-600 my-3">{employees.length}</p>
              <p className="text-gray-600 text-sm">Under your management</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-600">
              <h3 className="font-semibold mb-2">Present Today</h3>
              <p className="text-4xl font-bold text-purple-600 my-3">{presentToday}</p>
              <p className="text-gray-600 text-sm">Checked in</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-600">
              <h3 className="font-semibold mb-2">Pending Tasks</h3>
              <p className="text-4xl font-bold text-purple-600 my-3">{pendingTasksCount}</p>
              <p className="text-gray-600 text-sm">Assigned tasks</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-600">
              <h3 className="font-semibold mb-2">Payroll Status</h3>
              <p className="text-4xl font-bold text-purple-600 my-3">Ready</p>
              <p className="text-gray-600 text-sm">Current month</p>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <>
            <div className="mb-5">
              <button
                onClick={() => setShowAddEmployee(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
              >
                + Add Employee
              </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Employee Directory</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="text-left p-3 font-semibold">Name</th>
                      <th className="text-left p-3 font-semibold">Employee ID</th>
                      <th className="text-left p-3 font-semibold">Position</th>
                      <th className="text-left p-3 font-semibold">Department</th>
                      <th className="text-left p-3 font-semibold">Email</th>
                      <th className="text-left p-3 font-semibold">Status</th>
                      <th className="text-left p-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{emp.name}</td>
                        <td className="p-3">{emp.id}</td>
                        <td className="p-3">{emp.position}</td>
                        <td className="p-3">{emp.department}</td>
                        <td className="p-3">{emp.email}</td>
                        <td className="p-3">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditEmployee(emp)}
                              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                              title="Edit Employee"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => deleteEmployee(emp.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'tasks' && (
          <>
            <div className="mb-5">
              <button
                onClick={() => setShowAssignTask(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
              >
                + Assign New Task
              </button>
            </div>
            {showAssignTask && (
              <div className="bg-white p-6 rounded-lg shadow mb-5 max-w-2xl">
                <h3 className="text-xl font-semibold mb-4">Assign Task</h3>
                <div className="mb-4">
                  <label className="block mb-2 font-medium">Employee</label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                  >
                    <option value="">Select employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block mb-2 font-medium">Task Description</label>
                  <textarea
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    rows={3}
                    placeholder="Enter task description"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 font-medium">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={assignTask}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
                  >
                    Assign
                  </button>
                  <button
                    onClick={() => setShowAssignTask(false)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">All Tasks</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="text-left p-3 font-semibold">Assigned To</th>
                      <th className="text-left p-3 font-semibold">Task</th>
                      <th className="text-left p-3 font-semibold">Due Date</th>
                      <th className="text-left p-3 font-semibold">Status</th>
                      <th className="text-left p-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => {
                      const emp = employees.find(e => e.id === task.assigned_to);
                      return (
                        <tr key={task.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{emp?.name || 'Unknown'}</td>
                          <td className="p-3">{task.title}</td>
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
                              onClick={() => deleteTask(task.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'payroll' && (
          <>
            <div className="mb-5">
              <button
                onClick={processPayroll}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
              >
                Process Payroll
              </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Payroll Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="text-left p-3 font-semibold">Employee</th>
                      <th className="text-left p-3 font-semibold">Base Salary</th>
                      <th className="text-left p-3 font-semibold">Bonus</th>
                      <th className="text-left p-3 font-semibold">Deductions</th>
                      <th className="text-left p-3 font-semibold">Net Pay</th>
                      <th className="text-left p-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => {
                      const bonus = 5000;
                      const deductions = Math.floor(emp.base_salary * 0.1);
                      const netPay = emp.base_salary + bonus - deductions;
                      return (
                        <tr key={emp.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{emp.name}</td>
                          <td className="p-3">₹{emp.base_salary.toLocaleString()}</td>
                          <td className="p-3">₹{bonus.toLocaleString()}</td>
                          <td className="p-3">₹{deductions.toLocaleString()}</td>
                          <td className="p-3 font-bold">₹{netPay.toLocaleString()}</td>
                          <td className="p-3">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              Ready
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'performance' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Employee Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="text-left p-3 font-semibold">Employee</th>
                    <th className="text-left p-3 font-semibold">Rating</th>
                    <th className="text-left p-3 font-semibold">Tasks Completed</th>
                    <th className="text-left p-3 font-semibold">Attendance %</th>
                    <th className="text-left p-3 font-semibold">Last Review</th>
                    <th className="text-left p-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const perf = performance.find(p => p.emp_id === emp.id);
                    return (
                      <tr key={emp.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{emp.name}</td>
                        <td className="p-3">{perf?.rating || '-'}</td>
                        <td className="p-3">{perf?.tasks_completed || 0}</td>
                        <td className="p-3">{perf?.attendance_percent || 0}%</td>
                        <td className="p-3">{perf?.last_review || '-'}</td>
                        <td className="p-3">
                          <button
                            onClick={() => alert(`Performance review for ${emp.name}`)}
                            className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showEditEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold">Edit Employee</h3>
              <button onClick={() => setShowEditEmployee(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-medium">Employee ID</label>
                <input
                  type="text"
                  value={editEmployee.id}
                  disabled
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Name</label>
                <input
                  type="text"
                  value={editEmployee.name}
                  onChange={(e) => setEditEmployee({ ...editEmployee, name: e.target.value })}
                  placeholder="Full name"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Position</label>
                <input
                  type="text"
                  value={editEmployee.position}
                  onChange={(e) => setEditEmployee({ ...editEmployee, position: e.target.value })}
                  placeholder="e.g., Developer"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Department</label>
                <select
                  value={editEmployee.department}
                  onChange={(e) => setEditEmployee({ ...editEmployee, department: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                >
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">Email</label>
                <input
                  type="email"
                  value={editEmployee.email}
                  onChange={(e) => setEditEmployee({ ...editEmployee, email: e.target.value })}
                  placeholder="email@company.com"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Phone</label>
                <input
                  type="tel"
                  value={editEmployee.phone}
                  onChange={(e) => setEditEmployee({ ...editEmployee, phone: e.target.value })}
                  placeholder="10-digit phone number"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Base Salary</label>
                <input
                  type="number"
                  value={editEmployee.baseSalary || ''}
                  onChange={(e) => setEditEmployee({ ...editEmployee, baseSalary: parseInt(e.target.value) || 0 })}
                  placeholder="50000"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Leave Balance</label>
                <input
                  type="number"
                  value={editEmployee.leaveBalance || ''}
                  onChange={(e) => setEditEmployee({ ...editEmployee, leaveBalance: parseInt(e.target.value) || 0 })}
                  placeholder="8"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Joining Date</label>
                <input
                  type="date"
                  value={editEmployee.joinDate}
                  onChange={(e) => setEditEmployee({ ...editEmployee, joinDate: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={updateEmployee}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700"
                >
                  Update Employee
                </button>
                <button
                  onClick={() => setShowEditEmployee(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold">Add New Employee</h3>
              <button onClick={() => setShowAddEmployee(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-medium">Name</label>
                <input
                  type="text"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  placeholder="Full name"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Employee ID</label>
                <input
                  type="text"
                  value={newEmployee.id}
                  onChange={(e) => setNewEmployee({ ...newEmployee, id: e.target.value })}
                  placeholder="e.g., EMP004"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Position</label>
                <input
                  type="text"
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                  placeholder="e.g., Developer"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Department</label>
                <select
                  value={newEmployee.department}
                  onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                >
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">Email</label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  placeholder="email@company.com"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Phone</label>
                <input
                  type="tel"
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                  placeholder="10-digit phone number"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Base Salary</label>
                <input
                  type="number"
                  value={newEmployee.baseSalary || ''}
                  onChange={(e) => setNewEmployee({ ...newEmployee, baseSalary: parseInt(e.target.value) || 0 })}
                  placeholder="50000"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Joining Date</label>
                <input
                  type="date"
                  value={newEmployee.joinDate}
                  onChange={(e) => setNewEmployee({ ...newEmployee, joinDate: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={addEmployee}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
                >
                  Add Employee
                </button>
                <button
                  onClick={() => setShowAddEmployee(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
