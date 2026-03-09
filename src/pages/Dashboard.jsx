import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import AssignmentList from "../components/AssignmentList";

function Dashboard() {
  return (
    <div className="dashboardLayout">
      <Navbar />

      <div className="dashboardContainer">
        <Sidebar />

        <main className="dashboardContent">
          <h1>Welcome Back 👋</h1>
          <AssignmentList />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;