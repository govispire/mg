import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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

// Sample users for demo purposes
const DEMO_USERS = [
  {
    id: '1',
    name: 'Student User',
    email: 'student@example.com',
    password: 'password123',
    role: 'student' as UserRole,
    targetExam: 'IBPS PO',
    avatar: ''
  },
  {
    id: '2',
    name: 'Employee User',
    email: 'employee@example.com',
    password: 'password123',
    role: 'employee' as UserRole,
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin' as UserRole,
  },
  {
    id: '4',
    name: 'Super Admin',
    email: 'superadmin@example.com',
    password: 'password123',
    role: 'super-admin' as UserRole,
  },
  {
    id: '5',
    name: 'Owner User',
    email: 'owner@example.com',
    password: 'password123',
    role: 'owner' as UserRole,
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is stored in localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // In a real app, this would be an API call
    const foundUser = DEMO_USERS.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      // Remove password before storing user
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${foundUser.name}!`,
      });

      // Redirect based on role
      switch (foundUser.role) {
        case 'student':
          navigate('/student/dashboard');
          break;
        case 'employee':
          navigate('/employee/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'super-admin':
          navigate('/super-admin/dashboard');
          break;
        case 'owner':
          navigate('/owner/dashboard');
          break;
        default:
          navigate('/');
      }
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
      throw new Error("Invalid credentials");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate('/');
  };

  const register = async (name: string, email: string, password: string, role: UserRole = 'student') => {
    // Check if email already exists
    if (DEMO_USERS.some(u => u.email === email)) {
      toast({
        title: "Registration failed",
        description: "Email already in use",
        variant: "destructive",
      });
      throw new Error("Email already in use");
    }

    // In a real app, this would be an API call to create a user
    const newUser = {
      id: String(DEMO_USERS.length + 1),
      name,
      email,
      role,
    };

    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    toast({
      title: "Registration successful",
      description: `Welcome, ${name}!`,
    });

    // Redirect based on role
    switch (role) {
      case 'student':
        navigate('/student/dashboard');
        break;
      default:
        navigate('/');
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
