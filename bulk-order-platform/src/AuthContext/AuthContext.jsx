import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser({ token, isAdmin: res.data.isAdmin });
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('http://localhost:5000/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser({ token: res.data.token, isAdmin: res.data.isAdmin });
  };

  const register = async (email, password) => {
    // Validate email format
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format. Email must include '@' and a valid domain (e.g., user@example.com).");
    }
    // Basic password validation
    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }
    await axios.post('http://localhost:5000/register', { email, password });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};