import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import InternList from './pages/InternList';
import TaskManagement from './pages/TaskManagement';
import Performance from './pages/Performance';
import Reports from './pages/Reports';
import Attendance from './pages/Attendance';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
            <Toaster position="top-right" />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <div className="flex">
                      <Sidebar />
                      <div className="flex-1 p-8">
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/interns" element={<InternList />} />
                          <Route path="/tasks" element={<TaskManagement />} />
                          <Route path="/performance" element={<Performance />} />
                          <Route path="/reports" element={<Reports />} />
                          <Route path="/attendance" element={<Attendance />} />
                        </Routes>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;