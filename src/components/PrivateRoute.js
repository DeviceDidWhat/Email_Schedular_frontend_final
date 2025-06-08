import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element: Component }) => {
  // Check if userName and tokenId exist in localStorage
  const userName = localStorage.getItem('username');
  const tokenId = localStorage.getItem('authToken');

  // If either is missing, redirect to the login page
  if (!userName || !tokenId) {
    return <Navigate to="/login" replace />;
  }

  // If both are present, render the component
  return Component;
};

export default PrivateRoute;
