
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { EmployeeCategory } from '@/types/employee';

export type UserRole = 'student' | 'employee' | 'admin' | 'super-admin' | 'owner' | 'mentor' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  targetExam?: string;
  secondaryExam?: string;
  examCategory?: string;
  state?: string;
  avatar?: string;
  employeeCategory?: EmployeeCategory;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<void>;
}

// Sample users for demo purposes - including category-specific accounts
const DEMO_USERS = [
  {
    id: '1',
    name: 'Student User',
    email: 'student@example.com',
    password: 'password123',
    role: 'student' as UserRole,
    targetExam: 'IBPS PO',
    secondaryExam: 'SSC CGL',
    examCategory: 'banking',
    state: 'maharashtra',
    avatar: ''
  },
  {
    id: '2',
    name: 'Employee User',
    email: 'employee@example.com',
    password: 'password123',
    role: 'employee' as UserRole,
    examCategory: 'railway',
    state: 'delhi',
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin' as UserRole,
    examCategory: 'ssc',
    state: 'karnataka',
  },
  {
    id: '4',
    name: 'Super Admin',
    email: 'superadmin@example.com',
    password: 'password123',
    role: 'super-admin' as UserRole,
    examCategory: 'upsc',
    state: 'delhi',
  },
  {
    id: '5',
    name: 'Owner User',
    email: 'owner@example.com',
    password: 'password123',
    role: 'owner' as UserRole,
    examCategory: 'state-psc',
    state: 'gujarat',
  },
  {
    id: '6',
    name: 'Mentor User',
    email: 'mentor@example.com',
    password: 'password123',
    role: 'mentor' as UserRole,
    examCategory: 'banking',
    state: 'maharashtra',
  },
  // Category-specific employee accounts
  {
    id: '7',
    name: 'Dr. Priya Sharma',
    email: 'expert@example.com',
    password: 'password123',
    role: 'employee' as UserRole,
    employeeCategory: 'subject-matter-expert' as EmployeeCategory,
    examCategory: 'mathematics',
    state: 'delhi',
  },
  {
    id: '8',
    name: 'Rahul Kumar',
    email: 'creator@example.com',
    password: 'password123',
    role: 'employee' as UserRole,
    employeeCategory: 'content-creator' as EmployeeCategory,
    examCategory: 'english',
    state: 'maharashtra',
  },
  {
    id: '9',
    name: 'Anjali Patel',
    email: 'developer@example.com',
    password: 'password123',
    role: 'employee' as UserRole,
    employeeCategory: 'test-developer' as EmployeeCategory,
    examCategory: 'banking',
    state: 'gujarat',
  },
  {
    id: '10',
    name: 'Suresh Mehta',
    email: 'reviewer@example.com',
    password: 'password123',
    role: 'employee' as UserRole,
    employeeCategory: 'quality-reviewer' as EmployeeCategory,
    examCategory: 'ssc',
    state: 'rajasthan',
  },
  {
    id: '11',
    name: 'Kavita Singh',
    email: 'moderator@example.com',
    password: 'password123',
    role: 'employee' as UserRole,
    employeeCategory: 'content-moderator' as EmployeeCategory,
    examCategory: 'general-knowledge',
    state: 'punjab',
  },
  {
    id: '12',
    name: 'Arjun Reddy',
    email: 'support@example.com',
    password: 'password123',
    role: 'employee' as UserRole,
    employeeCategory: 'technical-support' as EmployeeCategory,
    examCategory: 'technical',
    state: 'telangana',
  },
  // Category-specific admin accounts
  {
    id: '13',
    name: 'Banking Admin',
    email: 'admin-banking@example.com',
    password: 'password123',
    role: 'admin' as UserRole,
    examCategory: 'banking',
    state: 'mumbai',
  },
  {
    id: '14',
    name: 'SSC Admin',
    email: 'admin-ssc@example.com',
    password: 'password123',
    role: 'admin' as UserRole,
    examCategory: 'ssc',
    state: 'delhi',
  },
  {
    id: '15',
    name: 'Railway Admin',
    email: 'admin-railway@example.com',
    password: 'password123',
    role: 'admin' as UserRole,
    examCategory: 'railway',
    state: 'kolkata',
  },
  {
    id: '16',
    name: 'UPSC Admin',
    email: 'admin-upsc@example.com',
    password: 'password123',
    role: 'admin' as UserRole,
    examCategory: 'upsc',
    state: 'delhi',
  },
  {
    id: '17',
    name: 'TNPSC Admin',
    email: 'admin-tnpsc@example.com',
    password: 'password123',
    role: 'admin' as UserRole,
    examCategory: 'state-psc',
    state: 'tamil-nadu',
  },
  {
    id: '18',
    name: 'Defence Admin',
    email: 'admin-defence@example.com',
    password: 'password123',
    role: 'admin' as UserRole,
    examCategory: 'defence',
    state: 'delhi',
  },
  {
    id: '19',
    name: 'Judicial Admin',
    email: 'admin-judicial@example.com',
    password: 'password123',
    role: 'admin' as UserRole,
    examCategory: 'judicial',
    state: 'delhi',
  },
  {
    id: '20',
    name: 'Regulatory Admin',
    email: 'admin-regulatory@example.com',
    password: 'password123',
    role: 'admin' as UserRole,
    examCategory: 'regulatory',
    state: 'mumbai',
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
      localStorage.removeItem('userProfile');
      localStorage.removeItem('studentPresence');
      localStorage.removeItem('quizCompletions');

      // Dispatch events to notify useLocalStorage hooks
      window.dispatchEvent(new CustomEvent('local-storage-update', { detail: { key: 'userProfile', value: null } }));
      window.dispatchEvent(new CustomEvent('local-storage-update', { detail: { key: 'studentPresence', value: null } }));
      window.dispatchEvent(new CustomEvent('local-storage-update', { detail: { key: 'quizCompletions', value: null } }));

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
        case 'mentor':
          navigate('/mentor/dashboard');
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
    localStorage.removeItem('userProfile');
    localStorage.removeItem('studentPresence');
    localStorage.removeItem('quizCompletions');

    // Dispatch events to notify useLocalStorage hooks
    window.dispatchEvent(new CustomEvent('local-storage-update', { detail: { key: 'userProfile', value: null } }));
    window.dispatchEvent(new CustomEvent('local-storage-update', { detail: { key: 'studentPresence', value: null } }));
    window.dispatchEvent(new CustomEvent('local-storage-update', { detail: { key: 'quizCompletions', value: null } }));

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

    // Clear any existing session data to avoid bleed
    localStorage.removeItem('userProfile');
    localStorage.removeItem('studentPresence');
    localStorage.removeItem('quizCompletions');

    // Dispatch events to notify useLocalStorage hooks
    window.dispatchEvent(new CustomEvent('local-storage-update', { detail: { key: 'userProfile', value: null } }));
    window.dispatchEvent(new CustomEvent('local-storage-update', { detail: { key: 'studentPresence', value: null } }));
    window.dispatchEvent(new CustomEvent('local-storage-update', { detail: { key: 'quizCompletions', value: null } }));

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
