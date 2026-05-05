import DashboardNavbar from "../dashboard/DashboardNavbar";
import Sidebar from "../dashboard/Sidebar";
import "../../css/dashboard.css";

const TeacherShell = ({ user, title, intro, children }) => {
  return (
    <div className="dashboardWrapper">
      <DashboardNavbar />

      <div className="dashboardBody">
        <Sidebar user={user} />

        <main className="dashboardContent teacherContent">
          {(title || intro) && (
            <div className="teacherHero">
              <div>
                {title && <h1 className="welcomeTitle">{title}</h1>}
                {intro && <p className="teacherIntro">{intro}</p>}
              </div>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
};

export default TeacherShell;
