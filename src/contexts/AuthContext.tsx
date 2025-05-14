import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types';

// Updated to use our API service
import { api } from '@/services/api';
import { toast } from '@/components/ui/use-toast';

interface AuthState {
  user: User | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean }>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => ({ success: false }),
  logout: () => {},
  isAuthenticated: false,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);
  const navigate = useNavigate();

  const login = async (username: string, password: string) => {
    try {
      const { user, token } = await api.login(username, password);
      
      setState({ user, token });
      localStorage.setItem('token', token);
      
      // Log the login action
      if (user) {
        api.addLogEntry({
          action: 'login',
          userId: user.id,
          username: user.username,
        });
      }
      
      return { success: true };
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid username or password",
      });
      throw error;
    }
  };

  const logout = () => {
    setState({ user: null, token: null });
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    // Mock: Restore user from token if needed
    if (state.token && !state.user) {
      // In a real app, this would verify the token with the server
      // For demo, we'll just assume the admin user
      setState({
        ...state,
        user: {
          id: 'user-1',
          username: 'admin',
          role: 'admin',
          lastLogin: new Date().toISOString()
        }
      });
    }
  }, [state.token]);

  const value = {
    user: state.user,
    token: state.token,
    login,
    logout,
    isAuthenticated: !!state.user,
    isAdmin: state.user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
