// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    user: null,
    role: localStorage.getItem('role') || 'guest',
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (auth.token) {
        try {
          const response = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/auth/user`, {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          });
          const data = await response.json();
          if (response.ok) {
            setAuth({ ...auth, user: data.user, role: data.user.role });
          } else {
            setAuth({ token: null, user: null });
            localStorage.removeItem('token');
            localStorage.removeItem('role');
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          setAuth({ token: null, user: null });
          localStorage.removeItem('token');
          localStorage.removeItem('role');
        }
      }
    };

    fetchUser();
  }, [auth.token]);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
