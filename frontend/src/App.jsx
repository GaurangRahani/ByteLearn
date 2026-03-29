
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import StudentRegister from './pages/StudentRegister';
import EducatorRegister from './pages/EducatorRegister';
import VerifyOtp from './pages/VerifyOtp';
import Header from './components/layout/Header';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register-student" element={<StudentRegister />} />
            <Route path="/apply-educator" element={<EducatorRegister />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
