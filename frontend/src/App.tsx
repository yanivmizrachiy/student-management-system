import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import GradePage from './pages/GradePage';
import GroupPage from './pages/GroupPage';
import StudentPage from './pages/StudentPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/grades" element={<GradePage />} />
        <Route path="/group/:groupId" element={<GroupPage />} />
        <Route path="/student/:studentId" element={<StudentPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

