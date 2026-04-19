import { useState } from "react";
import NotificationPopup from "./NotificationPopup";

const notifications = [
  {
    id: 1,
    title: "Submission saved",
    message: "Your latest assignment submission is ready.",
    time: "Just now",
  },
  {
    id: 2,
    title: "Reminder",
    message: "Check upcoming due dates for this week.",
    time: "Today",
  },
];

const DashboardNavbar = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

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

        <div className="searchWrapper">
          <img src="/search.png" alt="" />
          <input
            className="searchBar"
            placeholder="Search assignments..."
          />
        </div>

        <div className="notificationWrapper">
          <button
            className="notificationBtn"
            type="button"
            aria-label="Notifications"
            aria-expanded={isNotificationOpen}
            onClick={() => setIsNotificationOpen((isOpen) => !isOpen)}
          >
            <img src="/notification.png" alt="" />
          </button>

          {isNotificationOpen && <NotificationPopup notifications={notifications} />}
        </div>

      </div>

    </div>
  );
};

export default DashboardNavbar;
