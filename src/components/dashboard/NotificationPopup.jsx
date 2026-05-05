const NotificationPopup = ({
  notifications,
  unreadCount,
  hasReadNotifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearRead,
}) => {
  return (
    <div className="notificationPopup" role="dialog" aria-label="Notifications">
      <div className="notificationHeader">
        <h3>Notifications</h3>
        <span>{unreadCount} unread</span>
      </div>

      <div className="notificationActions">
        <button className="notificationActionBtn" type="button" onClick={onMarkAllAsRead}>
          Mark all read
        </button>
        <button
          className="notificationActionBtn"
          type="button"
          onClick={onClearRead}
          disabled={!hasReadNotifications}
        >
          Clear read
        </button>
      </div>

      <div className="notificationList">
        {notifications.length === 0 ? (
          <p className="emptyState">No notifications right now.</p>
        ) : (
          notifications.map((notification) => (
            <button
              className={`notificationItem ${notification.read ? "notificationItemRead" : ""}`}
              key={notification.id}
              type="button"
              onClick={() => onMarkAsRead(notification.id)}
            >
              <div className="notificationDot" />
              <div>
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
                <span>{notification.time}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPopup;
