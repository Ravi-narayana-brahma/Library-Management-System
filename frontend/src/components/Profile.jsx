import { useEffect, useState } from "react";
import { showToast } from "../../public/toast";
import "./Auth.css";
import { getAdminProfile } from "../api";

export default function AdminProfile() {

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getAdminProfile()
      .then(data => setProfile(data))
      .catch(() =>
        showToast("Unable to load admin profile", "error")
      );
  }, []);

  if (!profile)
    return <p style={{ padding: 20 }}>Loading profile...</p>;

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <h1>Admin Profile</h1>
      </div>

      <div className="profile-wrapper">

        {/* Left */}
        <div className="profile-left">
          <div className="profile-avatar">🛠️</div>
          <h2>{profile.username}</h2>
          <p className="profile-role">Administrator</p>
        </div>

        {/* Right */}
        <div className="profile-right">
          <div className="profile-grid">

            <div className="profile-item">
              <label>Username</label>
              <span>{profile.username}</span>
            </div>

            <div className="profile-item">
              <label>Email</label>
              <span>{profile.email}</span>
            </div>

            <div className="profile-item">
              <label>Status</label>
              <span>
                {profile.verified ? "Verified" : "Not Verified"}
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
