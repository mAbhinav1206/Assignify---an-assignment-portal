const NotificationPopup = ({ notifications }) => {
  return (
    <div className="notificationPopup" role="dialog" aria-label="Notifications">
      <div className="notificationHeader">
        <h3>Notifications</h3>
        <span>{notifications.length} new</span>
      </div>

      <div className="notificationList">
        {notifications.map((notification) => (
          <div className="notificationItem" key={notification.id}>
            <div className="notificationDot" />
            <div>
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
              <span>{notification.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPopup;
