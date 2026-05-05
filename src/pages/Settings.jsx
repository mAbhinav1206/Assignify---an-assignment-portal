import { useEffect, useState } from "react";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import Sidebar from "../components/dashboard/Sidebar";
import { apiRequest, getStoredUser, saveSession } from "../api";
import { useSettings } from "../settings";
import "../css/dashboard.css";

const Settings = () => {
  const [user, setUser] = useState(getStoredUser());
  const [error, setError] = useState("");
  const { settings, updateSettings } = useSettings();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await apiRequest("/me");
        saveSession(data);
        setUser(data.user);
      } catch (loadError) {
        setError(loadError.message);
      }
    };

    loadProfile();
  }, []);

  const handleToggle = (key) => {
    updateSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleSelectChange = (key, value) => {
    updateSettings({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="dashboardWrapper">
      <DashboardNavbar />

      <div className="dashboardBody">
        <Sidebar user={user} />

        <main className="dashboardContent settingsContent">
          <div className="settingsHero">
            <div>
              <h1 className="welcomeTitle">Settings</h1>
              <p className="settingsIntro">
                Tune the dashboard, reminders, and the overall feel of Assignify.
              </p>
            </div>
          </div>

          {error && <p className="formError">{error}</p>}

          <section className="settingsPanel">
            <div className="settingsSection">
              <h2>Appearance</h2>
              <div className="settingsGrid">
                <div className="settingsItem">
                  <div>
                    <strong>Dark mode</strong>
                    <p>Switch the app to a darker look for late-night study sessions.</p>
                  </div>
                  <button
                    className={`toggleSwitch ${settings.theme === "dark" ? "toggleOn" : ""}`}
                    type="button"
                    aria-pressed={settings.theme === "dark"}
                    onClick={() => handleSelectChange("theme", settings.theme === "dark" ? "light" : "dark")}
                  >
                    <span />
                  </button>
                </div>

                <div className="settingsItem">
                  <div>
                    <strong>Compact dashboard</strong>
                    <p>Reduce spacing to fit more assignments without extra scrolling.</p>
                  </div>
                  <button
                    className={`toggleSwitch ${settings.compactDashboard ? "toggleOn" : ""}`}
                    type="button"
                    aria-pressed={settings.compactDashboard}
                    onClick={() => handleToggle("compactDashboard")}
                  >
                    <span />
                  </button>
                </div>
              </div>
            </div>

            <div className="settingsDivider" />

            <div className="settingsSection">
              <h2>Notifications</h2>
              <div className="settingsGrid">
                <div className="settingsItem">
                  <div>
                    <strong>Enable notifications</strong>
                    <p>Show alert updates in the top-right bell popup.</p>
                  </div>
                  <button
                    className={`toggleSwitch ${settings.notificationsEnabled ? "toggleOn" : ""}`}
                    type="button"
                    aria-pressed={settings.notificationsEnabled}
                    onClick={() => handleToggle("notificationsEnabled")}
                  >
                    <span />
                  </button>
                </div>

                <div className="settingsItem">
                  <div>
                    <strong>Email reminders</strong>
                    <p>Keep reminder preferences ready for future email notification support.</p>
                  </div>
                  <button
                    className={`toggleSwitch ${settings.emailReminders ? "toggleOn" : ""}`}
                    type="button"
                    aria-pressed={settings.emailReminders}
                    onClick={() => handleToggle("emailReminders")}
                  >
                    <span />
                  </button>
                </div>

                <label className="settingsSelectItem">
                  <span>Reminder lead time</span>
                  <select
                    value={settings.reminderLeadTime}
                    onChange={(event) => handleSelectChange("reminderLeadTime", event.target.value)}
                  >
                    <option>1 Day Before</option>
                    <option>2 Days Before</option>
                    <option>1 Week Before</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="settingsDivider" />

            <div className="settingsSection">
              <h2>Workspace</h2>
              <div className="settingsGrid">
                <div className="settingsItem">
                  <div>
                    <strong>Due soon highlights</strong>
                    <p>Visually emphasize assignments that need attention soon.</p>
                  </div>
                  <button
                    className={`toggleSwitch ${settings.dueSoonHighlights ? "toggleOn" : ""}`}
                    type="button"
                    aria-pressed={settings.dueSoonHighlights}
                    onClick={() => handleToggle("dueSoonHighlights")}
                  >
                    <span />
                  </button>
                </div>

                <div className="settingsItem">
                  <div>
                    <strong>Open dashboard after login</strong>
                    <p>Go straight to the main workspace after login when setup is complete.</p>
                  </div>
                  <button
                    className={`toggleSwitch ${settings.autoOpenDashboard ? "toggleOn" : ""}`}
                    type="button"
                    aria-pressed={settings.autoOpenDashboard}
                    onClick={() => handleToggle("autoOpenDashboard")}
                  >
                    <span />
                  </button>
                </div>

                <label className="settingsSelectItem">
                  <span>Week starts on</span>
                  <select
                    value={settings.weekStartsOn}
                    onChange={(event) => handleSelectChange("weekStartsOn", event.target.value)}
                  >
                    <option>Monday</option>
                    <option>Sunday</option>
                  </select>
                </label>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Settings;
