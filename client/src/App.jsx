import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RTLLayout from './components/common/RTLLayout';
import TeacherGuard from './components/common/TeacherGuard';

// Teacher pages
import TeacherLogin from './pages/teacher/TeacherLogin';
import HomePage from './pages/teacher/HomePage';
import LiveMonitor from './pages/teacher/LiveMonitor';
import Analytics from './pages/teacher/Analytics';
import QuestionBank from './pages/teacher/QuestionBank';

// Student pages
import JoinScreen from './pages/student/JoinScreen';
import QuizFlow from './pages/student/QuizFlow';
import CompletionScreen from './pages/student/CompletionScreen';

export default function App() {
  return (
    <BrowserRouter>
      <RTLLayout>
        <Routes>
          {/* Public */}
          <Route path="/join" element={<JoinScreen />} />
          <Route path="/quiz/:pin" element={<QuizFlow />} />
          <Route path="/done" element={<CompletionScreen />} />

          {/* Teacher login */}
          <Route path="/teacher/login" element={<TeacherLogin />} />

          {/* Protected teacher routes */}
          <Route path="/teacher" element={<TeacherGuard><HomePage /></TeacherGuard>} />
          <Route path="/teacher/monitor/:pin" element={<TeacherGuard><LiveMonitor /></TeacherGuard>} />
          <Route path="/teacher/analytics/:pin" element={<TeacherGuard><Analytics /></TeacherGuard>} />
          <Route path="/teacher/questions" element={<TeacherGuard><QuestionBank /></TeacherGuard>} />

          {/* Default */}
          <Route path="*" element={<Navigate to="/join" replace />} />
        </Routes>
      </RTLLayout>
    </BrowserRouter>
  );
}
