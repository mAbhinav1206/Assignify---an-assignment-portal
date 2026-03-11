import React from "react";

const Sidebar = () => {
  return (
    <div className="sidebar">

      <div className="menuItem active">Dashboard</div>
      <div className="menuItem">Courses</div>
      <div className="menuItem">Assignments</div>
      <div className="menuItem">Calendar</div>
      <div className="menuItem">Progress</div>
      <div className="menuItem">Settings</div>

    </div>
  );
};

export default Sidebar;