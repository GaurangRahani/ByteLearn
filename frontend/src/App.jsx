import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import StudentRegister from './pages/auth/StudentRegister';
import EducatorRegister from './pages/auth/EducatorRegister';
import VerifyOtp from './pages/auth/VerifyOtp';
import EducatorStatus from './pages/auth/EducatorStatus';
import EducatorDashboard from './pages/educator/EducatorDashboard';
import CreateCourse from './pages/educator/CreateCourse';
import MyCourses from './pages/educator/MyCourses';
import Login from './pages/auth/Login';
import Header from './components/layout/Header';
import StudentDashboard from './pages/student/StudentDashboard';
import BrowseCourse from './pages/student/BrowseCourse';

const AppContent = () => {
  const location = useLocation();
  // Hide global Header if we are on an educator/student dashboard or course flow
  const hideGlobalHeader = 
    location.pathname.startsWith('/educator') || 
    location.pathname.startsWith('/student-dashboard') || 
    location.pathname.startsWith('/browse') ||
    location.pathname.startsWith('/course/');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {!hideGlobalHeader && <Header />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register-student" element={<StudentRegister />} />
          <Route path="/apply-educator" element={<EducatorRegister />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/educator-status" element={<EducatorStatus />} />
          <Route path="/educator-dashboard" element={<EducatorDashboard />} />
          <Route path="/educator/courses" element={<MyCourses />} />
          <Route path="/course/create" element={<CreateCourse />} />
          <Route path="/course/:id/curriculum" element={<div>Phase 2 Curriculum Builder Coming Soon...</div>} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/browse" element={<BrowseCourse />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
