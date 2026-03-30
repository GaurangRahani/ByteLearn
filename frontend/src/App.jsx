import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import StudentRegister from './pages/auth/StudentRegister';
import EducatorRegister from './pages/auth/EducatorRegister';
import VerifyOtp from './pages/auth/VerifyOtp';
import EducatorStatus from './pages/auth/EducatorStatus';
import EducatorDashboard from './pages/educator/EducatorDashboard';
import Login from './pages/auth/Login';
import Header from './components/layout/Header';
import StudentDashboard from './pages/student/StudentDashboard';

const AppContent = () => {
  const location = useLocation();
  // Hide global Header if we are on an educator/student dashboard authenticated layout
  const hideGlobalHeader = location.pathname.startsWith('/educator-dashboard') || location.pathname.startsWith('/student-dashboard');

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
          <Route path="/student-dashboard" element={<StudentDashboard />} />
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
