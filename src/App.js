import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ScheduleEmailForm from './components/ScheduleEmailForm';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import AdminPage from './components/AdminPage';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Default route redirects to Schedule Email form */}
      <Route path="/" element={<Navigate to="/schedule"/>} />

      {/* Route for the Schedule Email form (Protected) */}
      <Route path="/schedule" element={<PrivateRoute element={<ScheduleEmailForm />} />} />

      {/* Route for the Dashboard page */}
      <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />

      {/* Route for the Admin page */}
      <Route path="/admin" element={<AdminPage />} />

      {/* Route for the Registration form */}
      <Route path="/register" element={<PublicRoute element={<RegistrationForm />} />} />

     {/* Route for the Login form (Public Route) */}
     <Route path="/login" element={<PublicRoute element={<LoginForm />} />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <MainContent />
    </Router>
  );
};

const MainContent = () => {
  const location = useLocation();

  // List of paths where the Navbar should not be displayed
  const hiddenNavbarPaths = ['/login', '/register', '/admin'];

  // Determine if the Navbar should be shown
  const shouldShowNavbar = !hiddenNavbarPaths.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />} {/* Conditionally render Navbar */}
      <AppRoutes />
    </>
  );
};

export default App;