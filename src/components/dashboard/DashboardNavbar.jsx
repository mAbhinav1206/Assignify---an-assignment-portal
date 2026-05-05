import { useState } from "react";
import NotificationPopup from "./NotificationPopup";
import { useSettings } from "../../settings";
import BrandLogo from "../BrandLogo";
import useAssignmentNotifications from "../../hooks/useAssignmentNotifications";

const DashboardNavbar = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { settings } = useSettings();
  const {
    notifications,
    unreadCount,
    hasReadNotifications,
    markAsRead,
    markAllAsRead,
    clearReadNotifications,
  } = useAssignmentNotifications({
    enabled: settings.notificationsEnabled,
  });
  const visibleNotifications = settings.notificationsEnabled
    ? notifications
    : [
        {
          id: "paused",
          title: "Notifications paused",
          message: "Enable notifications again from Settings whenever you want updates.",
          time: "Settings",
          read: true,
        },
      ];

  return (
    <div className="navbar">

      <div className="logo">
        <BrandLogo compact />
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
            {settings.notificationsEnabled && unreadCount > 0 && (
              <span className="notificationBadge">{unreadCount}</span>
            )}
          </button>

          {isNotificationOpen && (
            <NotificationPopup
              notifications={visibleNotifications}
              unreadCount={settings.notificationsEnabled ? unreadCount : 0}
              hasReadNotifications={settings.notificationsEnabled ? hasReadNotifications : false}
              onMarkAsRead={settings.notificationsEnabled ? markAsRead : () => {}}
              onMarkAllAsRead={settings.notificationsEnabled ? markAllAsRead : () => {}}
              onClearRead={settings.notificationsEnabled ? clearReadNotifications : () => {}}
            />
          )}
        </div>

      </div>

    </div>
  );
};

export default DashboardNavbar;
