import React from "react";

const DashboardNavbar = () => {
  return (
    <div className="navbar">

      <div className="logo">
        <img
          src="/assignifyLogo.png"
          height="70px"
          alt="logo"
        />
      </div>

      <div className="navRight">

        <input
          className="searchBar"
          placeholder="Search assignments..."
        />

        <div className="navIcons">
          🔔
        </div>

        <div className="profile">
          👤 Abhinav
        </div>

      </div>

    </div>
  );
};

export default DashboardNavbar;