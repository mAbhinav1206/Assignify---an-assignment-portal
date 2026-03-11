import React from "react";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import Sidebar from "../components/dashboard/Sidebar";
import StatsCards from "../components/dashboard/StatsCards";
import AssignmentList from "../components/dashboard/AssignmentList";
import "../css/dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboardWrapper">

      <DashboardNavbar />

      <div className="dashboardBody">

        <Sidebar />

        <div className="dashboardContent">

          <h1 className="welcomeTitle">Welcome Back 👋</h1>

          <StatsCards />

          <AssignmentList />

        </div>

      </div>

    </div>
  );
};

export default Dashboard;