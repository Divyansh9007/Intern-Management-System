import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  TrendingUp, 
  FileText,
  UserCheck,
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();

  const menuItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/interns', icon: <Users size={20} />, label: 'Interns' },
    { path: '/tasks', icon: <CheckSquare size={20} />, label: 'Tasks' },
    { path: '/attendance', icon: <UserCheck size={20} />, label: 'Attendance' },
    { path: '/performance', icon: <TrendingUp size={20} />, label: 'Performance' },
    { path: '/reports', icon: <FileText size={20} />, label: 'Reports' },
  ];

  return (
    <div className="w-64 bg-white h-screen shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-indigo-600">InternHub</h1>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-600 transition-colors duration-300 hover:bg-indigo-50 hover:text-indigo-600 ${
                isActive ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600' : ''
              }`
            }
          >
            {item.icon}
            <span className="ml-3">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={logout}
          className="flex items-center w-full px-6 py-3 text-gray-600 transition-colors duration-300 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={20} />
          <span className="ml-3">Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;