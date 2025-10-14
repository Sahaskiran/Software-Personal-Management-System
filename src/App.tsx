import { useState } from 'react';
import Login from './components/Login';
import EmployeePortal from './components/EmployeePortal';
import ManagerPortal from './components/ManagerPortal';

function App() {
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    portalType: 'employee' | 'manager';
    empId?: string;
  } | null>(null);

  const handleLogin = (username: string, portalType: 'employee' | 'manager', empId?: string) => {
    setCurrentUser({ username, portalType, empId });
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  if (currentUser.portalType === 'employee' && currentUser.empId) {
    return <EmployeePortal empId={currentUser.empId} onLogout={handleLogout} />;
  }

  return <ManagerPortal onLogout={handleLogout} />;
}

export default App;
