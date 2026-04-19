import { useLocation, useNavigate } from "react-router-dom";
import { clearSession } from "../../api";

const Sidebar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const displayName = user?.profile?.fullName || user?.email || "Student";

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  return (
    <div className="sidebar">

      <div>
        <button
          className={`menuItem menuButton ${location.pathname === "/dashboard" ? "active" : ""}`}
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          Dashboard
        </button>
        <div className="menuItem">Courses</div>
        <div className="menuItem">Assignments</div>
        <div className="menuItem">Calendar</div>
        <div className="menuItem">Progress</div>
        <div className="menuItem">Settings</div>
      </div>

      <div className="sidebarFooter">
        <button
          className={`sidebarUserName ${location.pathname === "/profile" ? "active" : ""}`}
          type="button"
          onClick={() => navigate("/profile")}
        >
          {displayName}
        </button>

        <button className="logoutBtn sidebarLogoutBtn" type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>

    </div>
  );
};

export default Sidebar;
