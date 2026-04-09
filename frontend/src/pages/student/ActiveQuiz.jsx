import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Clock, BookOpen, CheckCircle2, Circle, Loader2 } from 'lucide-react';

const ActiveQuiz = () => {
    const { id: quizId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const courseId = location.state?.courseId;

    const [quizData, setQuizData] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [resolvedCourseId, setResolvedCourseId] = useState(courseId);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [attemptNumber, setAttemptNumber] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const initializeQuiz = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const startRes = await axios.post('/api/quiz-attempts/start', {
                    quizId,
                    courseId
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // New backend returns { quiz, questions, attemptNumber, courseId }
                const { quiz, questions, attemptNumber: nextAttemptNum, courseId: backendCourseId } = startRes.data;
                
                setQuizData({ ...quiz, questions }); // Combine quiz meta and questions
                setAttemptNumber(nextAttemptNum);
                setResolvedCourseId(backendCourseId || courseId);
                setTimeLeft((quiz.duration || 15) * 60);
                setStartTime(Date.now());
                setIsLoading(false);
            } catch (err) {
                console.error("Quiz Initialization Error:", err);
                setIsLoading(false);
            }
        };

        if (quizId) initializeQuiz();
    }, [quizId, courseId, navigate]);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0 || isSubmitting) {
            if (timeLeft === 0 && !isSubmitting) {
                handleSubmit();
            }
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isSubmitting]);

    const formatTime = (seconds) => {
        if (seconds === null) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOptionSelect = (index) => {
        const questionId = quizData.questions[currentQuestionIndex]._id;
        setAnswers(prev => ({
            ...prev,
            [questionId]: index
        }));
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const formattedAnswers = Object.entries(answers).map(([qId, sOpt]) => ({
                questionId: qId,
                selectedOption: sOpt
            }));

            // Calculate time taken in seconds
            const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

            const res = await axios.post('/api/quiz-attempts/submit', {
                quizId,
                courseId: resolvedCourseId,
                attemptNumber,
                timeTaken,
                answers: formattedAnswers
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate('/quiz-result', { state: { resultData: res.data, courseId: resolvedCourseId } });
        } catch (err) {
            console.error("Submission Error:", err);
            setIsSubmitting(false);
            alert("Failed to submit quiz. Please check your connection.");
        }
    };

    const goToPrevious = () => {
        if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
    };

    const goToNext = () => {
        if (currentQuestionIndex < quizData.questions.length - 1) setCurrentQuestionIndex(prev => prev + 1);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-slate-600 font-medium">Initializing quiz attempt...</p>
                </div>
            </div>
        );
    }

    if (!quizData || !quizData.questions.length) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-slate-600">No questions found for this quiz.</p>
            </div>
        );
    }

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const selectedOption = answers[currentQuestion._id];

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar (The Navigator) */}
                    <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
                        {/* Quiz Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Quiz</h2>
                            </div>
                            <h1 className="text-xl font-bold text-slate-900 leading-tight">
                                {quizData.title}
                            </h1>
                        </div>

                        {/* Timer Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Clock className="w-5 h-5 text-blue-600" />
                                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Time Remaining</h2>
                            </div>
                            <div className={`text-4xl font-mono font-bold ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>
                                {formatTime(timeLeft)}
                            </div>
                        </div>

                        {/* Question Track Map */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Question Map</h2>
                            <div className="grid grid-cols-5 gap-3">
                                {quizData.questions.map((q, idx) => {
                                    const isAnswered = answers[q._id] !== undefined;
                                    const isActive = currentQuestionIndex === idx;
                                    return (
                                        <button
                                            key={q._id}
                                            onClick={() => setCurrentQuestionIndex(idx)}
                                            className={`
                                                aspect-square flex items-center justify-center rounded-lg text-sm font-bold transition-all duration-200
                                                ${isAnswered ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                                                ${isActive ? 'ring-4 ring-blue-100 border-2 border-blue-600' : 'border-2 border-transparent'}
                                            `}
                                        >
                                            {idx + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Main Content (Question Engine) */}
                    <div className="lg:col-span-3 space-y-6 order-1 lg:order-2">
                        {/* Top Navigation Bar */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
                            <button
                                onClick={goToPrevious}
                                disabled={currentQuestionIndex === 0}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </button>
                            
                            <span className="text-sm font-semibold text-slate-500">
                                Question <span className="text-slate-900">{currentQuestionIndex + 1}</span> of {quizData.questions.length}
                            </span>

                            <button
                                onClick={goToNext}
                                disabled={currentQuestionIndex === quizData.questions.length - 1}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Question Area */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[550px] flex flex-col">
                            <div className="p-8 md:p-12 flex-grow">
                                <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-12 leading-snug">
                                    {currentQuestion.question}
                                </h3>

                                <div className="space-y-4">
                                    {currentQuestion.options.map((option, idx) => {
                                        const isSelected = selectedOption === idx;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleOptionSelect(idx)}
                                                className={`
                                                    w-full flex items-center justify-between p-5 rounded-xl border-2 text-left transition-all duration-200 group
                                                    ${isSelected 
                                                        ? 'border-blue-600 bg-blue-50/50 shadow-sm shadow-blue-50' 
                                                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}
                                                `}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`
                                                        w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors font-bold
                                                        ${isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 text-slate-400 group-hover:border-slate-400'}
                                                    `}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </div>
                                                    <span className={`text-lg font-medium ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                                                        {option}
                                                    </span>
                                                </div>
                                                {isSelected ? (
                                                    <CheckCircle2 className="w-6 h-6 text-blue-600 fill-blue-50" />
                                                ) : (
                                                    <Circle className="w-6 h-6 text-slate-200 group-hover:text-slate-300" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="bg-slate-50/50 border-t border-slate-100 p-6 flex justify-between items-center">
                                <p className="text-xs text-slate-400 font-medium italic">Progress auto-saved.</p>
                                <button 
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3.5 rounded-xl font-bold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-200 uppercase tracking-wide text-sm flex items-center gap-2"
                                >
                                    {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Quiz'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActiveQuiz;
