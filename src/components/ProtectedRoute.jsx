import { Navigate, useLocation } from "react-router-dom";
import { getStoredUser, getToken } from "../api";

function ProtectedRoute({ children, roles }) {
  const location = useLocation();

  if (!getToken()) {
    return <Navigate to="/" replace />;
  }

  const user = getStoredUser();

  if (roles?.length) {
    if (!user || !roles.includes(user.role)) {
      return (
        <Navigate
          to={user?.role === "admin" ? "/admin" : user?.role === "teacher" ? "/teacher" : "/dashboard"}
          replace
        />
      );
    }
  }

  if (user?.role === "teacher") {
    const isTeacherSetupRoute = location.pathname === "/teacher-setup";
    const isTeacherEditRoute = location.pathname === "/teacher/profile/edit";
    const isTeacherProfileComplete = Boolean(user.profile?.completed);

    if (!isTeacherProfileComplete && !isTeacherSetupRoute && !isTeacherEditRoute) {
      return <Navigate to="/teacher-setup" replace />;
    }

    if (isTeacherProfileComplete && isTeacherSetupRoute) {
      return <Navigate to="/teacher" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
