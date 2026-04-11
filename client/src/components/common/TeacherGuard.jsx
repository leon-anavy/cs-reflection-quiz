import { Navigate, useLocation } from 'react-router-dom';
import { isTeacherAuthenticated } from '../../pages/teacher/TeacherLogin';

export default function TeacherGuard({ children }) {
  const location = useLocation();

  if (!isTeacherAuthenticated()) {
    return <Navigate to="/teacher/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
