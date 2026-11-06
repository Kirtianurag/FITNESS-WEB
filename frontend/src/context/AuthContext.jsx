import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Ensure all Axios requests automatically carry the token from localStorage
axios.interceptors.request.use((config) => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
  } catch (e) {
    console.error('Error attaching token to request:', e);
  }
  return config;
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  useEffect(() => {
    // Interceptor to auto-logout if token is invalid or user no longer exists in DB
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;
        const msg = error.response?.data?.message?.toLowerCase() || '';
        if (status === 401 || (status === 404 && msg.includes('user'))) {
          console.warn("Session expired or user not found in database. Resetting session.");
          logout();
        }
        return Promise.reject(error);
      }
    );

    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;

          // Verify if user actually exists in the database
          const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/profile`);
          const verifiedUser = { ...parsedUser, ...data };
          setUser(verifiedUser);
          localStorage.setItem('user', JSON.stringify(verifiedUser));
        } catch (err) {
          console.warn("Auth check failed on startup:", err.response?.status);
          if (err.response?.status === 401 || err.response?.status === 404) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, { email, password });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  };

  const register = async (username, email, password, gender, age, weight) => {
    const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, { 
      username, email, password, gender, age, weight 
    });
    return data;
  };

  const updateUserInfo = (newData) => {
    if (!newData) return;
    setUser(prev => {
      const updated = { ...prev, ...newData };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
