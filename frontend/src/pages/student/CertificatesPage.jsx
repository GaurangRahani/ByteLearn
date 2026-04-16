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
                            <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-4">
                                My Certificates
                                <span className="text-xl font-black bg-blue-100 text-blue-600 px-3 py-0.5 rounded-xl">
                                    {certificates.length}
                                </span>
                            </h1>
                            <p className="text-slate-500 font-medium text-base max-w-xl">
                                Your hard work translated into official credentials. View, download, or share your earned certifications.
                            </p>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group hidden lg:block"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative bg-white p-6 rounded-3xl border border-slate-200 shadow-xl flex items-center gap-5">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <Star className="text-blue-600 fill-blue-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Elite Status</p>
                                    <p className="text-lg font-black text-slate-900 leading-none">Certified Learner</p>
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
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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
    const formatDate = (date) => new Date(date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <motion.div
            variants={variants}
            className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm p-6 transition-all hover:shadow-xl border-t-4 border-t-blue-600 h-full"
        >
            <div className="flex-grow flex flex-col">
                {/* Header: Eyebrow & Title */}
                <div className="mb-6 flex justify-between items-start">
                    <div className="flex-1">
                        <p className="text-[10px] font-bold tracking-widest text-blue-600 uppercase mb-2">
                            Certificate of Completion
                        </p>
                        <h3 className="text-lg font-bold text-slate-900 leading-snug">
                            {cert.courseId?.title}
                        </h3>
                        <p className="text-xs font-semibold text-slate-400 mt-1">
                            Instructor: {cert.educatorId?.name || "ByteLearn Academy"}
                        </p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-lg">
                        <Award className="w-6 h-6 text-blue-500 opacity-80" />
                    </div>
                </div>

                {/* Metrics Section: Structured Box */}
                <div className="flex items-center justify-between p-4 my-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Grade</span>
                        <span className="text-base font-bold text-slate-900">
                            {cert.gradeLabel} <span className="text-sm font-semibold text-blue-600">({cert.finalPercentage}%)</span>
                        </span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Issued On</span>
                        <span className="text-sm font-bold text-slate-900">
                            {formatDate(cert.issuedAt)}
                        </span>
                    </div>
                </div>

                {/* Footer: Credential ID (Seamless) */}
                <div className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-md mb-6 border border-dashed border-slate-200">
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Credential ID</span>
                    <span className="text-[10px] font-mono font-medium text-slate-400 uppercase">{cert.certificateId}</span>
                </div>

                {/* Actions: Primary & Secondary Buttons */}
                <div className="flex gap-3 mt-auto">
                    <a 
                        href={cert.pdfUrl} 
                        download={`Certificate-${cert.certificateId}.pdf`}
                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700 py-3 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/10 text-center uppercase tracking-widest active:scale-95"
                    >
                        Download PDF
                    </a>
                    <a 
                        href={cert.pdfUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 border-2 border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50 py-3 rounded-xl text-xs font-bold transition-all text-center uppercase tracking-widest active:scale-95"
                    >
                        View Full
                    </a>
                </div>
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
