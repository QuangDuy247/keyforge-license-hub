
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const initialUser: User | null = null;

const AuthContext = createContext<AuthContextType>({
  user: initialUser,
  loading: true,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check for saved auth on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Mock users for demonstration - In production, this would be from API
  const mockUsers = [
    { id: '1', username: 'admin', password: 'admin123', role: 'admin' as UserRole },
    { id: '2', username: 'staff', password: 'staff123', role: 'staff' as UserRole },
  ];

  const login = async (username: string, password: string) => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const foundUser = mockUsers.find(
      u => u.username === username && u.password === password
    );
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      const authenticatedUser = {
        ...userWithoutPassword,
        lastLogin: new Date().toISOString(),
      };
      
      localStorage.setItem('user', JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${username}!`,
      });
    } else {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
      throw new Error('Invalid credentials');
    }
    
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
