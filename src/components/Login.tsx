import { useState } from 'react';

interface LoginProps {
  onLogin: (username: string, portalType: 'employee' | 'manager', empId?: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [portalType, setPortalType] = useState<'employee' | 'manager'>('employee');

  const handleLogin = () => {
    if (!username || !password) {
      alert('Please enter credentials');
      return;
    }

    const empId = portalType === 'employee' ? 'EMP001' : undefined;
    onLogin(username, portalType, empId);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="m-auto bg-white p-10 rounded-lg shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">HR System</h1>

        <div className="mb-5">
          <label className="block mb-2 font-medium text-gray-700">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Employee ID or Manager"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2 font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">Portal Type</label>
          <select
            value={portalType}
            onChange={(e) => setPortalType(e.target.value as 'employee' | 'manager')}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
          >
            <option value="employee">Employee Portal</option>
            <option value="manager">Manager Portal</option>
          </select>
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Login
        </button>

        <p className="text-center mt-5 text-gray-600 text-sm">
          <strong>Demo:</strong> Use "raj" / "manager" for testing
        </p>
      </div>
    </div>
  );
}
