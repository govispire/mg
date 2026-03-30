import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

export type UserRole = 'student' | 'employee' | 'admin' | 'super-admin' | 'owner' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  targetExam?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<void>;
}

// No more hardcoded demo users — auth is handled by the backend API

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Rehydrate user from stored JWT token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    // Try to restore from cached user object first for instant render
    const cached = localStorage.getItem('user');
    if (cached) {
      try { setUser(JSON.parse(cached)); } catch {}
    }
    // Then verify with the backend and refresh
    api.getMe()
      .then(u => {
        const userObj: User = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role as UserRole,
          targetExam: u.targetExam,
          avatar: u.avatar,
        };
        setUser(userObj);
        localStorage.setItem('user', JSON.stringify(userObj));
      })
      .catch(() => {
        // Token invalid/expired — clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      });
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { token, user: u } = await api.login(email, password);

      const userObj: User = {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role as UserRole,
        targetExam: u.targetExam,
        avatar: u.avatar,
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);

      toast({
        title: 'Login successful',
        description: `Welcome back, ${u.name}!`,
      });

      // Mark daily presence on login
      api.markPresence().catch(() => {});

      // Redirect based on role
      switch (u.role) {
        case 'student':    navigate('/student/dashboard');    break;
        case 'employee':   navigate('/employee/dashboard');   break;
        case 'admin':      navigate('/admin/dashboard');      break;
        case 'super-admin':navigate('/super-admin/dashboard');break;
        case 'owner':      navigate('/owner/dashboard');      break;
        default:           navigate('/');
      }
    } catch (err: any) {
      toast({
        title: 'Login failed',
        description: err.message || 'Invalid email or password',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
    navigate('/');
  };

  const register = async (name: string, email: string, password: string, role: UserRole = 'student') => {
    try {
      const { token, user: u } = await api.register(name, email, password, role || 'student');

      const userObj: User = {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role as UserRole,
        targetExam: u.targetExam,
        avatar: u.avatar,
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);

      toast({
        title: 'Registration successful',
        description: `Welcome, ${name}!`,
      });

      // Mark daily presence on first login
      api.markPresence().catch(() => {});

      switch (role) {
        case 'student': navigate('/student/dashboard'); break;
        default:        navigate('/');
      }
    } catch (err: any) {
      toast({
        title: 'Registration failed',
        description: err.message || 'Could not create account',
        variant: 'destructive',
      });
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
