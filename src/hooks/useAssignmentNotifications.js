import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest, getStoredUser } from "../api";

const TWO_DAYS_IN_MS = 2 * 24 * 60 * 60 * 1000;
const POLL_INTERVAL_MS = 60 * 1000;

const getStorageKey = (userId) => `assignify_notifications_${userId}`;

const readNotificationStore = (userId) => {
  if (!userId) {
    return null;
  }

  const rawValue = localStorage.getItem(getStorageKey(userId));

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return {
      notifications: Array.isArray(parsedValue.notifications) ? parsedValue.notifications : [],
      seenAssignmentIds: Array.isArray(parsedValue.seenAssignmentIds) ? parsedValue.seenAssignmentIds : [],
    };
  } catch {
    return null;
  }
};

const writeNotificationStore = (userId, store) => {
  if (!userId) {
    return;
  }

  localStorage.setItem(getStorageKey(userId), JSON.stringify(store));
};

const sortNotifications = (notifications) =>
  [...notifications].sort((firstNotification, secondNotification) => {
    if (firstNotification.read !== secondNotification.read) {
      return firstNotification.read ? 1 : -1;
    }

    return new Date(secondNotification.createdAt) - new Date(firstNotification.createdAt);
  });

const formatNotificationTime = (notification) => {
  if (notification.type === "deadline" && notification.dueDate) {
    const msLeft = new Date(notification.dueDate).getTime() - Date.now();
    const hoursLeft = Math.max(1, Math.ceil(msLeft / (60 * 60 * 1000)));

    if (hoursLeft < 24) {
      return `${hoursLeft}h left`;
    }

    const daysLeft = Math.ceil(hoursLeft / 24);
    return `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
  }

  const createdAt = new Date(notification.createdAt).getTime();
  const hoursAgo = Math.max(0, Math.floor((Date.now() - createdAt) / (60 * 60 * 1000)));

  if (hoursAgo < 1) {
    return "Just now";
  }

  if (hoursAgo < 24) {
    return `${hoursAgo}h ago`;
  }

  const daysAgo = Math.floor(hoursAgo / 24);
  return `${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`;
};

const createNewAssignmentNotification = (assignment, existingNotification) => ({
  id: `new-${assignment.id}`,
  assignmentId: assignment.id,
  type: "new",
  title: "New assignment added",
  message: `${assignment.title} is now available in ${assignment.course}.`,
  dueDate: assignment.dueDate,
  createdAt: existingNotification?.createdAt || new Date().toISOString(),
  read: existingNotification?.read || false,
});

const createDeadlineNotification = (assignment, existingNotification) => ({
  id: `deadline-${assignment.id}`,
  assignmentId: assignment.id,
  type: "deadline",
  title: "Deadline approaching",
  message: `${assignment.title} is due in less than 2 days.`,
  dueDate: assignment.dueDate,
  createdAt: existingNotification?.createdAt || new Date().toISOString(),
  read: existingNotification?.read || false,
});

const useAssignmentNotifications = ({ enabled }) => {
  const [notifications, setNotifications] = useState([]);
  const [user] = useState(getStoredUser());

  const syncNotifications = useCallback(async () => {
    if (!enabled || user?.role !== "student" || !user?.id) {
      setNotifications([]);
      return;
    }

    const assignmentData = await apiRequest("/assignments");
    const assignments = assignmentData.assignments || [];
    const storedState = readNotificationStore(user.id);
    const isFirstSync = !storedState;
    const previousNotifications = storedState?.notifications || [];
    const previousSeenAssignmentIds = new Set(storedState?.seenAssignmentIds || []);
    const currentAssignmentIds = new Set(assignments.map((assignment) => assignment.id));
    const nextNotificationsById = new Map(
      previousNotifications.map((notification) => [notification.id, notification])
    );
    const nextSeenAssignmentIds = new Set(previousSeenAssignmentIds);

    assignments.forEach((assignment) => {
      const isDueSoon =
        !assignment.submission &&
        new Date(assignment.dueDate).getTime() - Date.now() > 0 &&
        new Date(assignment.dueDate).getTime() - Date.now() <= TWO_DAYS_IN_MS;

      if (!isFirstSync && !previousSeenAssignmentIds.has(assignment.id)) {
        const existingNotification = nextNotificationsById.get(`new-${assignment.id}`);
        nextNotificationsById.set(
          `new-${assignment.id}`,
          createNewAssignmentNotification(assignment, existingNotification)
        );
      }

      if (isDueSoon) {
        const existingNotification = nextNotificationsById.get(`deadline-${assignment.id}`);
        nextNotificationsById.set(
          `deadline-${assignment.id}`,
          createDeadlineNotification(assignment, existingNotification)
        );
      } else {
        nextNotificationsById.delete(`deadline-${assignment.id}`);
      }

      nextSeenAssignmentIds.add(assignment.id);
    });

    Array.from(nextNotificationsById.values()).forEach((notification) => {
      if (!currentAssignmentIds.has(notification.assignmentId)) {
        nextNotificationsById.delete(notification.id);
      }
    });

    const nextNotifications = sortNotifications(Array.from(nextNotificationsById.values()));

    writeNotificationStore(user.id, {
      notifications: nextNotifications,
      seenAssignmentIds: Array.from(nextSeenAssignmentIds),
    });

    setNotifications(nextNotifications);
  }, [enabled, user]);

  useEffect(() => {
    const initialSyncTimeout = window.setTimeout(() => {
      syncNotifications().catch(() => {
        setNotifications([]);
      });
    }, 0);

    if (!enabled || user?.role !== "student") {
      return () => {
        window.clearTimeout(initialSyncTimeout);
      };
    }

    const intervalId = window.setInterval(() => {
      syncNotifications().catch(() => {
        setNotifications([]);
      });
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearTimeout(initialSyncTimeout);
      window.clearInterval(intervalId);
    };
  }, [enabled, syncNotifications, user]);

  const persistNotifications = useCallback(
    (nextNotifications) => {
      if (!user?.id) {
        return;
      }

      const previousState = readNotificationStore(user.id);
      writeNotificationStore(user.id, {
        notifications: sortNotifications(nextNotifications),
        seenAssignmentIds: previousState?.seenAssignmentIds || [],
      });
      setNotifications(sortNotifications(nextNotifications));
    },
    [user]
  );

  const markAsRead = useCallback(
    (notificationId) => {
      persistNotifications(
        notifications.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );
    },
    [notifications, persistNotifications]
  );

  const markAllAsRead = useCallback(() => {
    persistNotifications(notifications.map((notification) => ({ ...notification, read: true })));
  }, [notifications, persistNotifications]);

  const clearReadNotifications = useCallback(() => {
    persistNotifications(notifications.filter((notification) => !notification.read));
  }, [notifications, persistNotifications]);

  const visibleNotifications = useMemo(
    () =>
      notifications.map((notification) => ({
        ...notification,
        time: formatNotificationTime(notification),
      })),
    [notifications]
  );

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  return {
    notifications: visibleNotifications,
    unreadCount,
    hasReadNotifications: notifications.some((notification) => notification.read),
    hasNotifications: notifications.length > 0,
    markAsRead,
    markAllAsRead,
    clearReadNotifications,
  };
};

export default useAssignmentNotifications;
