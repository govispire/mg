import React, { useState } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { User, Shield, UserCheck, Crown, Building, FileText, Target, Eye, MessageSquare, Wrench } from "lucide-react";
import { useAuth, UserRole } from '@/app/providers';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';
import { CompulsoryFormModal, WelcomeMessageModal } from './UpdatedAuthModal';

interface AuthModalProps {
  activeTab: "login" | "register";
  setActiveTab: (tab: "login" | "register") => void;
  selectedExam?: string;
  onClose?: () => void;
  onRegistrationSuccess?: (username: string) => void;
}

interface UserProfile {
  username: string;
  email: string;
  phone: string;
  examCategory: string;
  customExamCategory?: string;
  targetExam: string;
  customTargetExam?: string;
  preparationStartDate: Date | null;
  state: string;
}

const demoAccounts = [
  {
    role: 'student',
    email: 'student@example.com',
    password: 'password123',
    name: 'Student User',
    description: 'Access student dashboard, tests, and learning resources',
    icon: User,
    color: 'bg-blue-500'
  },
  {
    role: 'mentor',
    email: 'mentor@example.com',
    password: 'password123',
    name: 'Mentor User',
    description: 'Manage students, assign tasks, and track progress',
    icon: UserCheck,
    color: 'bg-green-500'
  },
  {
    role: 'employee',
    email: 'employee@example.com',
    password: 'password123',
    name: 'Employee User',
    description: 'General employee dashboard',
    icon: Building,
    color: 'bg-purple-500'
  },
  {
    role: 'super-admin',
    email: 'superadmin@example.com',
    password: 'password123',
    name: 'Super Admin',
    description: 'Full system access and advanced administration',
    icon: Crown,
    color: 'bg-red-500'
  },
  {
    role: 'owner',
    email: 'owner@example.com',
    password: 'password123',
    name: 'Owner User',
    description: 'Complete platform ownership and control',
    icon: Crown,
    color: 'bg-yellow-500'
  },
];



const AuthModal = ({ activeTab, setActiveTab, selectedExam, onClose, onRegistrationSuccess }: AuthModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('student');

  // Enhanced registration fields
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('+91 '); // Default India country code
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Modal states for new flow
  const [showCompulsoryForm, setShowCompulsoryForm] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [registeredUsername, setRegisteredUsername] = useState('');

  const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>('userProfile', null);

  const { login, register } = useAuth();

  const validateRegistrationForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!username.trim()) errors.username = 'Username is required';
    if (!email.trim()) errors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Email is invalid';
    if (!phone.trim() || phone === '+91 ') errors.phone = 'Phone number is required';
    if (!password) errors.password = 'Password is required';
    if (password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleQuickLogin = async (demoAccount: typeof demoAccounts[0]) => {
    try {
      await login(demoAccount.email, demoAccount.password);
    } catch (error) {
      console.error('Quick login failed:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRegistrationForm()) return;

    try {
      await register(username, email, password, role);

      // Store basic info
      setRegisteredUsername(username);

      if (onRegistrationSuccess) {
        onRegistrationSuccess(username);
      } else {
        // Fallback or legacy behavior (should ideally not happen with new LandingHeader)
        if (onClose) onClose();

        // Show success message and wait 10 seconds before showing compulsory form
        toast.success("Account created successfully! Redirecting to profile setup in 10 seconds...");

        // Show compulsory form after 10 seconds
        setTimeout(() => {
          setShowCompulsoryForm(true);
        }, 10000);
      }

    } catch (error) {
      console.error('Registration failed:', error);
      toast.error("Registration failed. Please try again.");
    }
  };

  const handleCompulsoryFormComplete = (data: any) => {
    // Store complete profile data locally
    const profileData: UserProfile = {
      username: registeredUsername,
      email,
      phone,
      examCategory: data.examCategory,
      customExamCategory: data.customExamCategory,
      targetExam: data.targetExam,
      customTargetExam: data.customTargetExam,
      preparationStartDate: data.preparationStartDate,
      state: data.state
    };
    setUserProfile(profileData);

    // Hide compulsory form and show welcome message
    setShowCompulsoryForm(false);
    setShowWelcomeMessage(true);
  };



  return (
    <div className="w-full max-w-lg mx-auto px-4 sm:px-6">
      <DialogTitle className="text-2xl font-bold text-center mb-2">
        {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
      </DialogTitle>
      <DialogDescription className="text-center text-gray-600 mb-6">
        {activeTab === 'login'
          ? 'Sign in to your account or try a demo account'
          : 'Join PrepSmart to start your exam preparation journey'
        }
      </DialogDescription>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login" className="text-sm sm:text-base">Login</TabsTrigger>
          <TabsTrigger value="register" className="text-sm sm:text-base">Register</TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="space-y-6">
          {/* Quick Demo Login Section */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Try Demo Accounts</h3>
              <p className="text-sm text-gray-600 mb-4">Quick access to explore different user roles</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {demoAccounts.slice(0, 4).map((account) => (
                <Button
                  key={account.role}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-gray-50"
                  onClick={() => handleQuickLogin(account)}
                >
                  <div className={`p-2 rounded-full ${account.color} text-white`}>
                    <account.icon className="h-4 w-4" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm">{account.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{account.description}</div>
                  </div>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {demoAccounts.slice(4).map((account) => (
                <Button
                  key={account.role}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-gray-50"
                  onClick={() => handleQuickLogin(account)}
                >
                  <div className={`p-2 rounded-full ${account.color} text-white`}>
                    <account.icon className="h-4 w-4" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm">{account.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{account.description}</div>
                  </div>
                </Button>
              ))}
            </div>


          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or login manually</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <a href="#" className="text-xs text-brand-blue hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>

            <Button type="submit" className="w-full h-12 text-base font-medium">
              Login
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="register" className="space-y-6">
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Username & Email */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">Username</Label>
              <Input
                id="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={cn("h-12 text-base", formErrors.username && "border-red-500")}
              />
              {formErrors.username && <p className="text-red-500 text-xs">{formErrors.username}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-email" className="text-sm font-medium">Email Address</Label>
              <Input
                id="register-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn("h-12 text-base", formErrors.email && "border-red-500")}
              />
              {formErrors.email && <p className="text-red-500 text-xs">{formErrors.email}</p>}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={cn("h-12 text-base", formErrors.phone && "border-red-500")}
              />
              {formErrors.phone && <p className="text-red-500 text-xs">{formErrors.phone}</p>}
              <p className="text-xs text-muted-foreground">📱 Default country: India (+91)</p>
            </div>

            {/* Password & Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="register-password" className="text-sm font-medium">Password</Label>
              <Input
                id="register-password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn("h-12 text-base", formErrors.password && "border-red-500")}
              />
              {formErrors.password && <p className="text-red-500 text-xs">{formErrors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn("h-12 text-base", formErrors.confirmPassword && "border-red-500")}
              />
              {formErrors.confirmPassword && <p className="text-red-500 text-xs">{formErrors.confirmPassword}</p>}
            </div>

            {/* Role Selection (for demo) */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">Role (Demo Purposes)</Label>
              <Select value={role as string} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  <SelectItem value="student" className="text-base py-3">Student</SelectItem>
                  <SelectItem value="mentor" className="text-base py-3">Mentor</SelectItem>
                  <SelectItem value="employee" className="text-base py-3">Employee</SelectItem>
                  <SelectItem value="super-admin" className="text-base py-3">Super Admin</SelectItem>
                  <SelectItem value="owner" className="text-base py-3">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-medium">
              Create Account
            </Button>

            <p className="text-xs text-center text-gray-500 pt-2">
              By registering, you agree to our{' '}
              <a href="#" className="text-brand-blue hover:underline">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="text-brand-blue hover:underline">Privacy Policy</a>.
            </p>
          </form>
        </TabsContent>
      </Tabs>

      {/* Compulsory Form Modal */}
      <CompulsoryFormModal
        open={showCompulsoryForm}
        onOpenChange={setShowCompulsoryForm}
        username={registeredUsername}
        onComplete={handleCompulsoryFormComplete}
        role={role}
      />

      {/* Welcome Message Modal */}
      <WelcomeMessageModal
        open={showWelcomeMessage}
        onOpenChange={(open) => {
          setShowWelcomeMessage(open);
          // Reset form when welcome message is closed
          if (!open) {
            setUsername('');
            setEmail('');
            setPhone('+91 ');
            setPassword('');
            setConfirmPassword('');
            setFormErrors({});
          }
        }}
        username={registeredUsername}
        userInitial={registeredUsername.charAt(0).toUpperCase()}
      />
    </div>
  );
};

export default AuthModal;
