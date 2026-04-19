import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import Sidebar from "../components/dashboard/Sidebar";
import { apiRequest, getStoredUser, saveSession } from "../api";
import "../css/dashboard.css";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());
  const [error, setError] = useState("");
  const profile = user?.profile || {};
  const personalDetails = [
    ["Username", profile.username],
    ["University", profile.university],
    ["Course", profile.course],
    ["Year", profile.year],
  ];
  const academicPreferences = [
    ["Major", profile.major],
    ["Favorite Subject", profile.favoriteSubject],
    ["Study Time", profile.studyTime],
    ["Reminder", profile.reminder],
    ["Subjects", profile.subjects?.length ? profile.subjects.join(", ") : ""],
  ];

  const renderField = ([label, value]) => (
    <div className="profileField" key={label}>
      <span>{label}</span>
      <strong>{value || "Not added"}</strong>
    </div>
  );

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await apiRequest("/me");
        saveSession(data);
        setUser(data.user);
      } catch (error) {
        setError(error.message);
      }
    };

    loadProfile();
  }, []);

  return (
    <div className="dashboardWrapper">
      <DashboardNavbar />

      <div className="dashboardBody">
        <Sidebar user={user} />

        <main className="dashboardContent profileContent">
          <div className="profileHeader">
            <div className="profileAvatarLarge">
              {profile.avatar ? <img src={profile.avatar} alt="Profile" /> : <span>{profile.fullName?.[0] || "S"}</span>}
            </div>

            <div>
              <h1 className="welcomeTitle">{profile.fullName || "Student Profile"}</h1>
              <p className="profileEmail">{user?.email}</p>
            </div>
          </div>

          {error && <p className="formError">{error}</p>}

          <section className="profilePanel">
            <div className="profileSectionHeader">
              <div>
                <h2>Profile Information</h2>
                <p>Your account details and study preferences in one place.</p>
              </div>
            </div>

            <div className="profileSection">
              <h3>Personal Details</h3>
              <div className="profileFieldGrid">
                {personalDetails.map(renderField)}
              </div>
            </div>

            <div className="profileDivider" />

            <div className="profileSection">
              <h3>Academic Preferences</h3>
              <div className="profileFieldGrid">
                {academicPreferences.map(renderField)}
              </div>
            </div>
          </section>

          <div className="profileActions">
            <button className="viewBtn" type="button" onClick={() => navigate("/profile-setup")}>
              Edit Profile
            </button>
            <button className="viewBtn" type="button" onClick={() => navigate("/profile-step-2")}>
              Edit Preferences
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
