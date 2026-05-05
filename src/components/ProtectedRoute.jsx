import { Navigate } from "react-router-dom";
import { getStoredUser, getToken } from "../api";

function ProtectedRoute({ children, roles }) {
  if (!getToken()) {
    return <Navigate to="/" replace />;
  }

  if (roles?.length) {
    const user = getStoredUser();

    if (!user || !roles.includes(user.role)) {
      return <Navigate to={user?.role === "teacher" ? "/teacher" : "/dashboard"} replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
