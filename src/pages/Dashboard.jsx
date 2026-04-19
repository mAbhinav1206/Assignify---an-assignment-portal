import React, { useEffect, useState } from "react";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import Sidebar from "../components/dashboard/Sidebar";
import StatsCards from "../components/dashboard/StatsCards";
import AssignmentList from "../components/dashboard/AssignmentList";
import "../css/dashboard.css";
import { apiRequest, getStoredUser } from "../api";

const Dashboard = () => {
  const storedUser = getStoredUser();
  const [stats, setStats] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = async () => {
    setError("");
    setIsLoading(true);

    try {
      const [dashboardData, assignmentData] = await Promise.all([
        apiRequest("/dashboard"),
        apiRequest("/assignments")
      ]);

      setStats(dashboardData.stats);
      setAssignments(assignmentData.assignments);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="dashboardWrapper">

      <DashboardNavbar />

      <div className="dashboardBody">

        <Sidebar user={storedUser} />

        <div className="dashboardContent dashboardPageContent">

          <h1 className="welcomeTitle">
            Welcome Back{storedUser?.profile?.fullName ? `, ${storedUser.profile.fullName}` : ""}
          </h1>

          {error && <p className="formError">{error}</p>}

          <StatsCards stats={stats} isLoading={isLoading} />

          <AssignmentList
            assignments={assignments}
            isLoading={isLoading}
            onSubmitted={loadDashboard}
          />

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
