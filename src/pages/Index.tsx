
import React from 'react';
import Layout from '@/components/Layout';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import UserTypesSection from '@/components/home/UserTypesSection';
import PricingSection from '@/components/home/PricingSection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturesSection />
      <UserTypesSection />
      <PricingSection />
    </Layout>
  );
};

export default Index;
