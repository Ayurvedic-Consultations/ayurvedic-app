// src/components/ProtectedRoute.js
import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function ProtectedRoute() {
  const { auth } = useContext(AuthContext);

  return auth.token && auth.user ? <Outlet /> : <Navigate to="/signin" />;
}

export default ProtectedRoute;
