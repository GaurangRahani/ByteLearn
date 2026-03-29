import React from 'react';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/FeaturesSection';
import CtaSection from '../components/home/CtaSection';

const Home = () => {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <CtaSection />
      <Footer />
    </>
  );
};

export default Home;
