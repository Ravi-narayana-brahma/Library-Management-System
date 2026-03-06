import { useEffect, useState } from "react";
import "./Student.css";
import { showToast } from "../../../public/toast";
import { getStudentProfile } from "../../api";

export default function Profile() {

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getStudentProfile()
      .then(setProfile)
      .catch(() => showToast("Unable to load profile", "error"));
  }, []);

  if (!profile) return <p style={{ padding: 20 }}>Loading profile...</p>;

  return (
    <div>
      {/* Page Header */}
      <div className="student-page-header">
        <h1 className="h1">👤 My Profile</h1>
        <span>Student information overview</span>
      </div>

      <div className="profile-wrapper">
        {/* Left */}
        <div className="profile-left">
          <div className="profile-avatar">👨‍🎓</div>
          <h2>{profile.name}</h2>
          <p className="profile-role">Student</p>
        </div>

        {/* Right */}
        <div className="profile-right">
          <div className="profile-grid">

            <div className="profile-item">
              <label>Roll Number</label>
              <span>{profile.rollNo}</span>
            </div>

            <div className="profile-item">
              <label>Email</label>
              <span>{profile.email}</span>
            </div>

            <div className="profile-item">
              <label>Department</label>
              <span>{profile.department}</span>
            </div>

            <div className="profile-item">
              <label>Year</label>
              <span>{profile.year}</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
