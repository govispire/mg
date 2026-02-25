import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Menu, X } from 'lucide-react';
import { toast } from 'sonner';
import AuthModal from './auth/AuthModal';
import { CompulsoryFormModal, WelcomeMessageModal } from './auth/UpdatedAuthModal';
import { useLocalStorage } from '@/hooks/useLocalStorage';

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
  avatar?: string;
}

const LandingHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeAuthTab, setActiveAuthTab] = useState<"login" | "register">("login");
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);

  // Post-signup flow state
  const [showCompulsoryForm, setShowCompulsoryForm] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [registeredUsername, setRegisteredUsername] = useState('');
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>('userProfile', null);

  const handleRegistrationSuccess = (username: string) => {
    setRegisteredUsername(username);
    setIsRegisterDialogOpen(false);

    toast.success("Account created successfully! Redirecting to profile setup in 10 seconds...");

    setTimeout(() => {
      setShowCompulsoryForm(true);
    }, 10000); // 10 seconds delay as requested
  };

  const handleCompulsoryFormComplete = (data: any) => {
    // Store complete profile data locally
    const profileData: UserProfile = {
      username: registeredUsername,
      email: '', // Logic to get email would go here if needed
      phone: '',
      examCategory: data.examCategory,
      customExamCategory: data.customExamCategory,
      targetExam: data.targetExam,
      customTargetExam: data.customTargetExam,
      preparationStartDate: data.preparationStartDate,
      state: data.state,
      avatar: data.avatar
    };
    setUserProfile(profileData);

    setShowCompulsoryForm(false);
    setShowWelcomeMessage(true);
  };

  return (
    <header className="w-full py-2 px-4 lg:px-8 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">P</div>
          <span className="text-lg font-bold">PrepSmart</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <nav>
            <ul className="flex items-center gap-6">


              <li><Link to="/blog" className="text-sm hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="/current-affairs" className="text-sm hover:text-primary transition-colors">Current Affairs</Link></li>
              <li><Link to="/exam-notifications" className="text-sm hover:text-primary transition-colors">Exam Alerts</Link></li>
              <li><Link to="/downloads" className="text-sm hover:text-primary transition-colors">Downloads</Link></li>
              <li><Link to="/pricing" className="text-sm hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => { setActiveAuthTab("login"); setIsLoginDialogOpen(true); }}>Login</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-w-[95vw]">
                <AuthModal activeTab={activeAuthTab} setActiveTab={setActiveAuthTab} onClose={() => setIsLoginDialogOpen(false)} />
              </DialogContent>
            </Dialog>

            <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setActiveAuthTab("register"); setIsRegisterDialogOpen(true); }}>Sign Up</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-w-[95vw]">
                <AuthModal
                  activeTab={activeAuthTab}
                  setActiveTab={setActiveAuthTab}
                  onClose={() => setIsRegisterDialogOpen(false)}
                  onRegistrationSuccess={handleRegistrationSuccess}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background z-50 border-b shadow-md">
          <nav className="max-w-7xl mx-auto px-4 py-4">
            <ul className="flex flex-col gap-4">


              <li><Link to="/blog" className="block py-2" onClick={() => setIsMenuOpen(false)}>Blog</Link></li>
              <li><Link to="/current-affairs" className="block py-2" onClick={() => setIsMenuOpen(false)}>Current Affairs</Link></li>
              <li><Link to="/exam-notifications" className="block py-2" onClick={() => setIsMenuOpen(false)}>Exam Alerts</Link></li>
              <li><Link to="/downloads" className="block py-2" onClick={() => setIsMenuOpen(false)}>Downloads</Link></li>
              <li><Link to="/pricing" className="block py-2" onClick={() => setIsMenuOpen(false)}>Pricing</Link></li>
              <li className="pt-2 border-t">
                <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" onClick={() => { setActiveAuthTab("login"); setIsLoginDialogOpen(true); }}>Login</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] max-w-[95vw]">
                    <AuthModal activeTab={activeAuthTab} setActiveTab={setActiveAuthTab} onClose={() => setIsLoginDialogOpen(false)} />
                  </DialogContent>
                </Dialog>
              </li>
              <li>
                <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" onClick={() => { setActiveAuthTab("register"); setIsRegisterDialogOpen(true); }}>Sign Up</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] max-w-[95vw]">
                    <AuthModal
                      activeTab={activeAuthTab}
                      setActiveTab={setActiveAuthTab}
                      onClose={() => setIsRegisterDialogOpen(false)}
                      onRegistrationSuccess={handleRegistrationSuccess}
                    />
                  </DialogContent>
                </Dialog>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Root Level Modals for Post-Signup Flow */}
      <CompulsoryFormModal
        open={showCompulsoryForm}
        onOpenChange={setShowCompulsoryForm}
        username={registeredUsername}
        onComplete={handleCompulsoryFormComplete}
      />

      <WelcomeMessageModal
        open={showWelcomeMessage}
        onOpenChange={setShowWelcomeMessage}
        username={registeredUsername}
        userInitial={registeredUsername.charAt(0).toUpperCase()}
      />
    </header>
  );
};

export default LandingHeader;
