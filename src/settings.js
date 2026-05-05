import { useEffect, useState } from "react";

const SETTINGS_KEY = "assignify_settings";
const SETTINGS_EVENT = "assignify-settings-changed";

export const defaultSettings = {
  theme: "light",
  notificationsEnabled: true,
  compactDashboard: false,
  dueSoonHighlights: true,
  emailReminders: true,
  autoOpenDashboard: true,
  reminderLeadTime: "1 Day Before",
  weekStartsOn: "Monday",
};

export const getStoredSettings = () => {
  const rawSettings = localStorage.getItem(SETTINGS_KEY);

  if (!rawSettings) {
    return defaultSettings;
  }

  try {
    return {
      ...defaultSettings,
      ...JSON.parse(rawSettings),
    };
  } catch {
    return defaultSettings;
  }
};

export const applySettingsToDocument = (settings) => {
  document.body.classList.toggle("dark-theme", settings.theme === "dark");
  document.body.classList.toggle("compact-mode", Boolean(settings.compactDashboard));
};

export const saveSettings = (settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  applySettingsToDocument(settings);
  window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: settings }));
};

export const useSettings = () => {
  const [settings, setSettings] = useState(getStoredSettings());

  useEffect(() => {
    const handleSettingsChange = (event) => {
      setSettings(event.detail || getStoredSettings());
    };

    window.addEventListener(SETTINGS_EVENT, handleSettingsChange);

    return () => {
      window.removeEventListener(SETTINGS_EVENT, handleSettingsChange);
    };
  }, []);

  useEffect(() => {
    applySettingsToDocument(settings);
  }, [settings]);

  return {
    settings,
    updateSettings: (nextSettings) => {
      saveSettings(nextSettings);
      setSettings(nextSettings);
    },
  };
};
