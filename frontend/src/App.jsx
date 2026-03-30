import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import StudentRegister from './pages/StudentRegister';
import EducatorRegister from './pages/EducatorRegister';
import VerifyOtp from './pages/VerifyOtp';
import EducatorStatus from './pages/EducatorStatus';
import EducatorDashboard from './pages/EducatorDashboard';
import Login from './pages/Login';
import Header from './components/layout/Header';

const AppContent = () => {
  const location = useLocation();
  // Hide global Header if we are on an educator-specific authenticated layout
  const hideGlobalHeader = location.pathname.startsWith('/educator-dashboard');

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
