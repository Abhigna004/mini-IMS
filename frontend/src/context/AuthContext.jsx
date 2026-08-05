import { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Attempt silent session restore on app load (uses HTTP-only cookie)
  useEffect(() => {
    axios
      .post('/api/auth/refresh', {}, { withCredentials: true })
      .then(({ data }) => {
        window.__accessToken = data.data.accessToken;
        setUser(data.data.user);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await axios.post(
      '/api/auth/login',
      { email, password },
      { withCredentials: true }
    );
    window.__accessToken = data.data.accessToken;
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
    } catch (_) {}
    window.__accessToken = null;
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
