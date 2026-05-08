import { useEffect, useState } from "react";
import TeacherShell from "../components/teacher/TeacherShell";
import { apiRequest, getStoredUser, saveSession } from "../api";

const AdminProfile = () => {
  const [user, setUser] = useState(getStoredUser());
  const [error, setError] = useState("");
  const profile = user?.profile || {};
  const adminDetails = [
    ["Username", profile.username],
    ["Institution", profile.institution || profile.university],
    ["Designation", profile.designation],
    ["Bio", profile.bio],
  ];

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

  return (
    <TeacherShell user={user} title="" intro="">
      <div className="profileHeader">
        <div className="profileAvatarLarge">
          {profile.avatar ? <img src={profile.avatar} alt="Admin profile" /> : <span>{profile.fullName?.[0] || "A"}</span>}
        </div>
        <div>
          <h1 className="welcomeTitle">{profile.fullName || "Admin Profile"}</h1>
          <p className="profileEmail">{user?.email}</p>
        </div>
      </div>

      {error && <p className="formError">{error}</p>}

      <section className="profilePanel">
        <div className="profileSectionHeader">
          <div>
            <h2>Admin Information</h2>
            <p>Your admin account details and workspace identity.</p>
          </div>
        </div>

        <div className="profileFieldGrid">
          {adminDetails.map(([label, value]) => (
            <div className="profileField" key={label}>
              <span>{label}</span>
              <strong>{value || "Not added"}</strong>
            </div>
          ))}
        </div>
      </section>
    </TeacherShell>
  );
};

export default AdminProfile;
