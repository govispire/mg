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
    }, 10000);
  };

  const handleCompulsoryFormComplete = (data: any) => {
    const profileData: UserProfile = {
      username: registeredUsername,
      email: '',
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
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground shadow-sm">P</div>
          <div className="leading-none">
            <div className="text-base font-semibold text-foreground">Examerit</div>
            <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">Exam prep</div>
          </div>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          <nav>
            <ul className="flex items-center gap-6">
              <li><Link to="/blog" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Blog</Link></li>
              <li><Link to="/current-affairs" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Current Affairs</Link></li>
              <li><Link to="/exam-notifications" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Exam Alerts</Link></li>
              <li><Link to="/downloads" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Downloads</Link></li>
              <li><Link to="/pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Pricing</Link></li>
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="px-5" onClick={() => { setActiveAuthTab("login"); setIsLoginDialogOpen(true); }}>Login</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-w-[95vw]">
                <AuthModal activeTab={activeAuthTab} setActiveTab={setActiveAuthTab} onClose={() => setIsLoginDialogOpen(false)} />
              </DialogContent>
            </Dialog>

            <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
              <DialogTrigger asChild>
                <Button className="px-5" onClick={() => { setActiveAuthTab("register"); setIsRegisterDialogOpen(true); }}>Sign Up</Button>
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

        <button
          className="rounded-md p-2 text-foreground transition-colors hover:bg-accent md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-border/80 bg-card md:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-4">
            <ul className="flex flex-col gap-3">
              <li><Link to="/blog" className="block py-2 text-sm font-medium text-foreground" onClick={() => setIsMenuOpen(false)}>Blog</Link></li>
              <li><Link to="/current-affairs" className="block py-2 text-sm font-medium text-foreground" onClick={() => setIsMenuOpen(false)}>Current Affairs</Link></li>
              <li><Link to="/exam-notifications" className="block py-2 text-sm font-medium text-foreground" onClick={() => setIsMenuOpen(false)}>Exam Alerts</Link></li>
              <li><Link to="/downloads" className="block py-2 text-sm font-medium text-foreground" onClick={() => setIsMenuOpen(false)}>Downloads</Link></li>
              <li><Link to="/pricing" className="block py-2 text-sm font-medium text-foreground" onClick={() => setIsMenuOpen(false)}>Pricing</Link></li>
              <li className="pt-2 border-t border-border">
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
