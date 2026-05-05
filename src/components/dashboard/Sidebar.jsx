import { useLocation, useNavigate } from "react-router-dom";
import { clearSession } from "../../api";

const Sidebar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const displayName = user?.profile?.fullName || user?.email || "Student";
  const avatar = user?.profile?.avatar;
  const isTeacher = user?.role === "teacher";
  const teacherMenuItems = [
    { label: "Analytics", path: "/teacher/analytics" },
    { label: "Courses", path: "/teacher/courses" },
    { label: "Students", path: "/teacher/students" },
    { label: "Assignments", path: "/teacher/assignments" },
    { label: "Settings", path: "/settings" },
  ];
  const studentMenuItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Courses", path: "/courses" },
    { label: "Assignments", path: "/assignments" },
    { label: "Calendar", path: "/calendar" },
    { label: "Progress", path: "/progress" },
    { label: "Settings", path: "/settings" },
  ];

  const handleMenuClick = (path) => {
    if (!path) {
      return;
    }

    navigate(path);
  };

  const isActivePath = (path) => location.pathname === path;

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  return (
    <div className="sidebar">

      <div>
        {(isTeacher ? teacherMenuItems : studentMenuItems).map((item) =>
          item.path ? (
            <button
              key={item.label}
              className={`menuItem menuButton ${isActivePath(item.path) ? "active" : ""}`}
              type="button"
              onClick={() => handleMenuClick(item.path)}
            >
              {item.label}
            </button>
          ) : (
            <div className="menuItem" key={item.label}>{item.label}</div>
          )
        )}
      </div>

      <div className="sidebarFooter">
        <button
          className={`sidebarUserName ${location.pathname === (isTeacher ? "/teacher/analytics" : "/profile") ? "active" : ""}`}
          type="button"
          onClick={() => navigate(isTeacher ? "/teacher/analytics" : "/profile")}
        >
          <span className="sidebarUserInfo">
            <span className="sidebarAvatar">
              {avatar ? <img src={avatar} alt="" /> : <span>{displayName[0]}</span>}
            </span>
            <span className="sidebarUserLabel">{displayName}</span>
          </span>
        </button>

        <button className="logoutBtn sidebarLogoutBtn" type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>

    </div>
  );
};

export default Sidebar;
