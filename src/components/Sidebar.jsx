import React from "react";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/assignments">Assignments</Link>
      <Link to="/courses">Courses</Link>
      <Link to="/profile">Profile</Link>
    </div>
  );
}

export default Sidebar;