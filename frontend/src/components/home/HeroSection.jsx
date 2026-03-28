import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-800 tracking-tight leading-tight mb-6">
          Transform Your Future with Online<br className="hidden sm:inline" /> Learning
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 mb-10">
          Join thousands of students learning from expert educators. Build skills, earn certificates, and achieve your goals.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link to="/register-student" className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors">
            Register as Student
          </Link>
          <Link to="/apply-educator" className="w-full sm:w-auto px-8 py-3 bg-white text-slate-700 font-semibold border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
            Apply as Educator
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
