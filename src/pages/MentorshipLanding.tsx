import React, { useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import LandingHeader from '@/components/layout/LandingHeader';
import Footer from '@/components/layout/Footer';
import HeroMentorship from '@/components/landing/mentorship/HeroMentorship';
import HowItWorksAndChoose from '@/components/landing/mentorship/HowItWorksAndChoose';
import FreeAssessmentForm from '@/components/landing/mentorship/FreeAssessmentForm';
import MentorProfiles from '@/components/landing/mentorship/MentorProfiles';
import MentorshipPlans from '@/components/landing/mentorship/MentorshipPlans';
import Testimonials from '@/components/landing/mentorship/Testimonials';
import FAQ from '@/components/landing/mentorship/FAQ';
import FinalCTA from '@/components/landing/mentorship/FinalCTA';

class ErrorBoundary extends Component<
  { children: ReactNode; label?: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; label?: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.label}]`, error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 text-red-900 font-mono my-4 mx-4 rounded-2xl">
          <h2 className="text-xl font-bold mb-2">Error in {this.props.label}</h2>
          <pre className="p-4 bg-red-100 rounded overflow-auto text-sm">
            {this.state.error?.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const MentorshipLanding = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check if user is authenticated and redirect to student mentorship dashboard
    if (isAuthenticated && user?.role === 'student') {
      navigate('/student/mentorship', { replace: true });
    }
  }, [navigate, isAuthenticated, user]);

  return (
    <div className="w-full min-h-screen bg-background">
      <LandingHeader />
      <main className="w-full">

        {/* 1. Hero — headline, image, floating cards, CTAs, stats */}
        <ErrorBoundary label="Hero">
          <HeroMentorship />
        </ErrorBoundary>

        {/* 2. How It Works + Choose Mentorship — side-by-side, same lavender bg */}
        <ErrorBoundary label="HowItWorksAndChoose">
          <HowItWorksAndChoose />
        </ErrorBoundary>

        {/* 3. Free Assessment Form — multi-step */}
        <ErrorBoundary label="Assessment Form">
          <FreeAssessmentForm />
        </ErrorBoundary>

        {/* 4. Mentor Profiles */}
        <ErrorBoundary label="Mentor Profiles">
          <MentorProfiles />
        </ErrorBoundary>

        {/* 5. Testimonials */}
        <ErrorBoundary label="Testimonials">
          <Testimonials />
        </ErrorBoundary>

        {/* 6. Pricing Plans */}
        <ErrorBoundary label="Plans">
          <MentorshipPlans />
        </ErrorBoundary>

        {/* 7. FAQ */}
        <ErrorBoundary label="FAQ">
          <FAQ />
        </ErrorBoundary>

        {/* 8. Final CTA */}
        <ErrorBoundary label="Final CTA">
          <FinalCTA />
        </ErrorBoundary>

      </main>
      <Footer />
    </div>
  );
};

export default MentorshipLanding;
