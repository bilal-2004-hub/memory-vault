import { createContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapUser = async () => {
      const token = localStorage.getItem('memory-vault-token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setUser(response.data.data || null);
      } catch (error) {
        localStorage.removeItem('memory-vault-token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapUser();
  }, []);

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const userData = response.data.data;
    localStorage.setItem('memory-vault-token', response.data.token);
    setUser(userData);
    return response.data;
  };

  const signup = async (credentials) => {
    const response = await api.post('/auth/signup', credentials);
    const userData = response.data.data;
    localStorage.setItem('memory-vault-token', response.data.token);
    setUser(userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('memory-vault-token');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      logout,
      setUser,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
