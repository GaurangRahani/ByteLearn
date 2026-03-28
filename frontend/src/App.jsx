
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

import StudentRegister from './pages/StudentRegister';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register-student" element={<StudentRegister />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
