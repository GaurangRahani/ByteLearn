import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Download, 
  ExternalLink, 
  Search,
  Calendar,
  BadgeCheck,
  ChevronRight,
  ShieldCheck,
  Star
} from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Footer from '../../components/layout/Footer';

const CertificatesPage = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [studentName, setStudentName] = useState('Student');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) return;

                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                // Fetch profile for name
                const profileRes = await axios.get('/api/auth/profile', config);
                if (profileRes.data && profileRes.data.data?.name) {
                    setStudentName(profileRes.data.data.name);
                } else if (profileRes.data && profileRes.data.name) {
                    setStudentName(profileRes.data.name);
                }

                const certRes = await axios.get('/api/certificates/me', config);
                setCertificates(certRes.data.data || []);
            } catch (error) {
                console.error("Error fetching certificates:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        visible: { 
            opacity: 1, 
            scale: 1, 
            y: 0, 
            transition: { duration: 0.5, ease: "easeOut" } 
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
                <DashboardHeader studentName={studentName} />
                <div className="flex-grow w-full max-w-7xl mx-auto px-6 py-12">
                    <div className="animate-pulse space-y-8">
                        <div className="h-12 w-1/3 bg-slate-200 rounded-2xl"></div>
                        <div className="h-24 w-full bg-slate-200 rounded-3xl"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-64 bg-slate-200 rounded-[40px]"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900">
            <DashboardHeader studentName={studentName} />
            
            <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-12">
                {/* Header Section */}
                <section className="mb-16">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-3 text-blue-600 font-black uppercase tracking-[0.2em] text-xs">
                                <ShieldCheck size={18} />
                                Verified Achievements
                            </div>
                            <h1 className="text-5xl font-black tracking-tight text-slate-900 flex items-center gap-4">
                                My Certificates
                                <span className="text-2xl font-black bg-blue-100 text-blue-600 px-4 py-1 rounded-2xl">
                                    {certificates.length}
                                </span>
                            </h1>
                            <p className="text-slate-500 font-medium text-lg max-w-xl">
                                Your hard work translated into official credentials. View, download, or share your earned certifications.
                            </p>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group hidden lg:block"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[40px] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative bg-white p-8 rounded-[40px] border border-slate-200 shadow-xl flex items-center gap-6">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                                    <Star className="text-blue-600 fill-blue-600" size={32} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Elite Status</p>
                                    <p className="text-xl font-black text-slate-900 leading-none">Certified Learner</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Grid Section */}
                <AnimatePresence mode="wait">
                    {certificates.length > 0 ? (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                        >
                            {certificates.map((cert) => (
                                <CertificateCard key={cert._id} cert={cert} variants={itemVariants} />
                            ))}
                        </motion.div>
                    ) : (
                        <EmptyState />
                    )}
                </AnimatePresence>
            </main>
            <Footer />
        </div>
    );
};

const CertificateCard = ({ cert, variants }) => {
    const formattedDate = new Date(cert.issuedAt).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <motion.div
            variants={variants}
            whileHover={{ y: -10 }}
            className="group bg-white rounded-[40px] overflow-hidden border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col h-full"
        >
            {/* Top Preview Section */}
            <div className="h-48 relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 transition-colors z-10"></div>
                <img 
                    src={cert.courseId?.thumbnail || 'https://via.placeholder.com/800x400'} 
                    alt={cert.courseId?.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-6 left-6 z-20">
                    <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                        {cert.courseId?.category || 'Professional'}
                    </div>
                </div>
                <div className="absolute bottom-6 left-6 z-20 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow-lg">
                        <Award size={18} className="text-white" />
                    </div>
                    <span className="text-white font-bold text-sm drop-shadow-md">Verified Achievement</span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-8 flex-grow flex flex-col">
                <div className="mb-6">
                    <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                        {cert.courseId?.title}
                    </h3>
                    <p className="text-slate-400 text-sm font-medium">Instructor: {cert.educatorId?.name || "ByLearn Academy"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Grade</p>
                        <p className="text-lg font-black text-slate-800">
                            {cert.gradeLabel} <span className="text-blue-600">({cert.finalPercentage}%)</span>
                        </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Issued On</p>
                        <p className="text-sm font-bold text-slate-800">{formattedDate}</p>
                    </div>
                </div>

                <div className="mt-auto flex flex-col gap-3">
                    <a 
                        href={cert.pdfUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-colors shadow-lg active:scale-95"
                    >
                        <ExternalLink size={20} />
                        View Full Size
                    </a>
                    <a 
                        href={cert.pdfUrl} 
                        download={`Certificate-${cert.certificateId}.pdf`}
                        className="w-full py-4 bg-white text-slate-900 border-2 border-slate-900 font-extrabold rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors active:scale-95"
                    >
                        <Download size={20} />
                        Download PDF
                    </a>
                </div>
            </div>
            
            {/* Serial ID Footer */}
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Credential ID: {cert.certificateId}
                </p>
            </div>
        </motion.div>
    );
};

const EmptyState = () => {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-full py-24 flex flex-col items-center justify-center bg-white rounded-[60px] border-2 border-dashed border-slate-200 text-center px-10"
        >
            <div className="w-32 h-32 bg-blue-50 rounded-[40px] flex items-center justify-center mb-8 rotate-3">
                <Award size={64} className="text-blue-300 -rotate-3" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4">Your wall of fame is waiting</h3>
            <p className="text-slate-500 max-w-lg mb-10 text-lg font-medium leading-relaxed">
                Complete your remaining assignments and quizzes with a passing grade to earn your official course certifications.
            </p>
            <a 
                href="/my-courses"
                className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center gap-3 active:scale-95"
            >
                Continue Learning <ChevronRight size={20} />
            </a>
        </motion.div>
    );
};

export default CertificatesPage;
