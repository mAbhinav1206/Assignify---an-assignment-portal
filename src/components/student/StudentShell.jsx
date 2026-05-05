import DashboardNavbar from "../dashboard/DashboardNavbar";
import Sidebar from "../dashboard/Sidebar";
import "../../css/dashboard.css";

const StudentShell = ({ user, title, intro, children }) => {
  return (
    <div className="dashboardWrapper">
      <DashboardNavbar />

      <div className="dashboardBody">
        <Sidebar user={user} />

        <main className="dashboardContent studentContent">
          {(title || intro) && (
            <div className="studentHero">
              <div>
                {title && <h1 className="welcomeTitle">{title}</h1>}
                {intro && <p className="studentIntro">{intro}</p>}
              </div>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
};

export default StudentShell;
