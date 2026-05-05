import { useCallback, useEffect, useState } from "react";
import { apiRequest, getStoredUser, saveSession } from "../api";

const useStudentWorkspaceData = () => {
  const [user, setUser] = useState(getStoredUser());
  const [stats, setStats] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadWorkspace = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      const [meData, dashboardData, assignmentData] = await Promise.all([
        apiRequest("/me"),
        apiRequest("/dashboard"),
        apiRequest("/assignments"),
      ]);

      saveSession(meData);
      setUser(meData.user);
      setStats(dashboardData.stats);
      setAssignments(assignmentData.assignments);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  return {
    user,
    stats,
    assignments,
    error,
    isLoading,
    reload: loadWorkspace,
  };
};

export default useStudentWorkspaceData;
