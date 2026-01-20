import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing auth
    const token = localStorage.getItem('authToken');
    if (token) {
      // For now, just set a mock user
      setUser({ id: 1, name: 'Demo User', email: 'demo@example.com' });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Mock login for now - will replace with real API later
    localStorage.setItem('authToken', 'mock-jwt-token');
    setUser({ id: 1, name: 'Demo User', email });
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);