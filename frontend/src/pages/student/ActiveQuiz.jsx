import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, BookOpen, CheckCircle2, Circle } from 'lucide-react';

const mockQuizData = {
  title: "Intermediate JavaScript Concepts",
  questions: [
    { id: '1', text: "What is the result of '2' + 2?", options: ["4", "'22'", "undefined", "NaN"] },
    { id: '2', text: "Which keyword is used to define a constant variable?", options: ["var", "let", "const", "def"] },
    { id: '3', text: "What does DOM stand for?", options: ["Data Object Model", "Document Object Model", "Digital Object Management", "Dynamic Object Mode"] },
    { id: '4', text: "Which array method adds an element to the end?", options: ["pop()", "shift()", "unshift()", "push()"] },
    { id: '5', text: "What is the default value of an uninitialized variable?", options: ["null", "0", "undefined", "NaN"] },
    { id: '6', text: "Which operator is used for strict equality?", options: ["==", "===", "=", "!="] },
    { id: '7', text: "How do you write a comment in JavaScript?", options: ["# comment", "<!-- comment -->", "// comment", "** comment"] },
    { id: '8', text: "What is an Anonymous function?", options: ["A function with no name", "A function with no arguments", "A function that is never called", "A private function"] },
    { id: '9', text: "Which method converts a JSON string to a JavaScript object?", options: ["JSON.stringify()", "JSON.parse()", "JSON.convert()", "JSON.object()"] },
    { id: '10', text: "What is the correct way to check the length of an array 'arr'?", options: ["arr.size()", "arr.length", "arr.count", "length(arr)"] },
  ]
};

const ActiveQuiz = () => {

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(900); // 15:00 minutes

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOptionSelect = (index) => {
        const questionId = mockQuizData.questions[currentQuestionIndex].id;
        setAnswers(prev => ({
            ...prev,
            [questionId]: index
        }));
    };

    const goToPrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const goToNext = () => {
        if (currentQuestionIndex < mockQuizData.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const currentQuestion = mockQuizData.questions[currentQuestionIndex];
    const selectedOption = answers[currentQuestion.id];

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
                                {mockQuizData.title}
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
                                {mockQuizData.questions.map((q, idx) => {
                                    const isAnswered = answers[q.id] !== undefined;
                                    const isActive = currentQuestionIndex === idx;
                                    return (
                                        <button
                                            key={q.id}
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
                            
                            <div className="mt-8 pt-6 border-t border-slate-100 space-y-3 font-medium text-xs text-slate-500">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-blue-600"></div>
                                    <span>Answered</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></div>
                                    <span>Unanswered</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-4 border-2 border-blue-600 rounded"></div>
                                    <span>Active</span>
                                </div>
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
                                Question <span className="text-slate-900">{currentQuestionIndex + 1}</span> of {mockQuizData.questions.length}
                            </span>

                            <button
                                onClick={goToNext}
                                disabled={currentQuestionIndex === mockQuizData.questions.length - 1}
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
                                    {currentQuestion.text}
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
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3.5 rounded-xl font-bold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-200 uppercase tracking-wide text-sm">
                                    Submit Quiz
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

