import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ element: Component }) => {
  // Check for cached userName and tokenId
  const userName = localStorage.getItem('username');
  const tokenId = localStorage.getItem('authToken');

  // If cache exists, redirect to /schedule
  if (userName && tokenId) {
    return <Navigate to="/schedule" replace />;
  }

  // Otherwise, render the component (e.g., login page)
  return Component;
};

export default PublicRoute;
