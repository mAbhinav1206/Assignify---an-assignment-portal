import { useCallback, useEffect, useState } from "react";
import { apiRequest, getStoredUser, saveSession } from "../api";

const useTeacherPageData = (endpoint, responseKey) => {
  const [user, setUser] = useState(getStoredUser());
  const [data, setData] = useState(undefined);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      const [meData, pageData] = await Promise.all([apiRequest("/me"), apiRequest(endpoint)]);
      saveSession(meData);
      setUser(meData.user);
      setData(responseKey ? pageData[responseKey] : pageData);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, responseKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { user, data, error, isLoading, reload: loadData };
};

export default useTeacherPageData;
