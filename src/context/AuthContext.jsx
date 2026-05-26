import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [roleMode, setRoleMode] = useState(() => localStorage.getItem('roleMode'));
  const [loading, setLoading] = useState(true);

  // Auto-verify user profile on load if JWT exists
  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await apiClient.get('/auth/me');
        if (res.data?.success) {
          const userData = res.data.data.user;
          setUser(userData);
          const savedMode = localStorage.getItem('roleMode');
          setRoleMode(savedMode || userData.role);
        } else {
          // Clean up stale session
          handleLogout();
        }
      } catch (err) {
        console.error('Session verification failed:', err.message);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [token]);

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { token: userToken, user: userData } = res.data.data;
        localStorage.setItem('token', userToken);
        localStorage.setItem('roleMode', userData.role);
        setToken(userToken);
        setUser(userData);
        setRoleMode(userData.role);
        return { success: true, user: userData };
      }
      return { success: false, message: 'Invalid server response' };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Login failed. Please verify credentials.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (name, email, password, phone, role = 'customer') => {
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/register', {
        name,
        email,
        password,
        phone,
        role,
      });
      if (res.data?.success) {
        const { token: userToken, user: userData } = res.data.data;
        localStorage.setItem('token', userToken);
        localStorage.setItem('roleMode', userData.role);
        setToken(userToken);
        setUser(userData);
        setRoleMode(userData.role);
        return { success: true };
      }
      return { success: false, message: 'Registration failed' };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Registration failed. Check your inputs.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('roleMode');
    setToken(null);
    setUser(null);
    setRoleMode(null);
  };

  const switchRoleMode = (mode) => {
    localStorage.setItem('roleMode', mode);
    setRoleMode(mode);
  };

  const refreshUser = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      if (res.data?.success) {
        const userData = res.data.data.user;
        setUser(userData);
        
        // Elevate automatically to shopOwner viewport on successful shop registration
        const userRoles = userData.roles || [userData.role || 'customer'];
        const savedMode = localStorage.getItem('roleMode');
        
        if (userRoles.includes('shopOwner') && savedMode === 'customer') {
          localStorage.setItem('roleMode', 'shopOwner');
          setRoleMode('shopOwner');
        } else if (savedMode && userRoles.includes(savedMode)) {
          setRoleMode(savedMode);
        } else {
          setRoleMode(userRoles[0] || 'customer');
        }

        return { success: true, user: userData };
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err.message);
    }
    return { success: false };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        refreshUser,
        roleMode,
        switchRoleMode,
        isAuthenticated: !!token && !!user,
        isShopOwner: roleMode === 'shopOwner' || roleMode === 'admin',
        isAdmin: roleMode === 'admin',
        realRole: user?.role,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
