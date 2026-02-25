import React from 'react';
import LandingHeader from '@/components/layout/LandingHeader';
import Hero from '@/components/layout/Hero';
import TrustSignals from '@/components/landing/TrustSignals';
import ExamCategoryIcons from '@/components/landing/ExamCategoryIcons';
import FeatureSection from '@/components/FeatureSection';
import FreeResourcesCTA from '@/components/landing/FreeResourcesCTA';
import VideoExplainer from '@/components/landing/VideoExplainer';
import MediaMentions from '@/components/landing/MediaMentions';
import ComparisonTable from '@/components/landing/ComparisonTable';
import FAQSection from '@/components/landing/FAQSection';

import SocialProofTicker from '@/components/landing/SocialProofTicker';
import Footer from '@/components/layout/Footer';

const Index = () => {
  return (
    <div className="w-full min-h-screen">
      <LandingHeader />
      <main className="w-full">
        <Hero />
        <TrustSignals />
        <ExamCategoryIcons />
        <FeatureSection />
        <FreeResourcesCTA />
        <VideoExplainer />
        <MediaMentions />
        <ComparisonTable />
        <FAQSection />

      </main>
      <Footer />
      <SocialProofTicker />
    </div>
  );
};

export default Index;
