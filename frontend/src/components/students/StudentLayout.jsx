import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import "./Student.css";

import {
  getCurrentUser,
  getStudentNotifications,
  markStudentNotificationRead,
  logout
} from "../../api";

export default function StudentLayout() {

  const navigate = useNavigate();

  const [hallTicket, setHallTicket] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔔 notifications
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);

useEffect(() => {

  const loadStudent = async () => {

    try {

      const user = await getCurrentUser();

      if (!user || user.role !== "STUDENT") {
        navigate("/student-login");
        return;
      }

      setHallTicket(user.hallTicket);
      setStudentName(user.name);

    } catch (err) {

      console.error(err);
      navigate("/student-login");

    } finally {

      setLoading(false);

    }

  };

  loadStudent();

}, [navigate]);

  // logout handler
  const handleLogout = async () => {

    try {
      await logout();
    } catch (err) {
      console.error(err);
    } finally {
      navigate("/student-login");
    }

  };
useEffect(() => {

  const loadNotifications = async () => {

    try {

      const notifData = await getStudentNotifications();
      setNotifications(Array.isArray(notifData) ? notifData : []);

    } catch (err) {
      console.error(err);
    }

  };

  loadNotifications();

  const interval = setInterval(loadNotifications, 1000); // refresh every 5 seconds

  return () => clearInterval(interval);

}, []);
  const unreadCount = notifications.filter(n => !n.viewed).length;

  const markAsRead = async (id) => {

  try {

    await markStudentNotificationRead(id);

    // update state AFTER backend success
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, viewed: true } : n
      )
    );

  } catch (err) {
    console.error("Failed to mark notification:", err);
  }

};
  if (loading) {
    return <p style={{ padding: 20 }}>Loading student...</p>;
  }

  return (

    <div className="student-layout">

      {/* SIDEBAR */}
      <aside className="student-sidebar">

        {/* LOGO */}
        <div className="student-brand">

          <img
            src={logo}
            alt="Library Logo"
            className="student-brand-logo"
          />

          <div className="student-brand-text">
            <h1 className="student-brand-name">Book Nexa</h1>
            <span className="student-brand-tagline">
              Smart Library System
            </span>
          </div>

        </div>

        {/* HEADER */}
        <div className="student-sidebar-header">

          <h2>🎓 Student</h2>

          <div
            className="notification-icon"
            onClick={() => setShowNotif(true)}
          >

            🔔

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount}
              </span>
            )}

          </div>

        </div>

        {/* MENU */}
        <button onClick={() => navigate("/student/dashboard")}>
          Dashboard
        </button>

        <button onClick={() => navigate("/student/all-books")}>
          All Books
        </button>

        <button onClick={() => navigate("/student/issued")}>
          My Books
        </button>

        <button onClick={() => navigate("/student/history")}>
          Return History
        </button>

        <button onClick={() => navigate("/student/reservations")}>
          Reservations
        </button>

        <button onClick={() => navigate("/student/fines")}>
          Fines
        </button>

        <button onClick={() => navigate("/student/profile")}>
          Profile
        </button>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>

      </aside>


      {/* PAGE CONTENT */}
      <main className="student-content">

        <Outlet context={{ hallTicket, studentName }} />

      </main>


      {/* 🔔 NOTIFICATION MODAL */}
      {showNotif && (

        <div className="modal-overlay">

          <div className="modal-box">

            <div className="modal-header">

              <h3>Notifications</h3>

              <button onClick={() => setShowNotif(false)}>
                ✖
              </button>

            </div>

            <div className="notification-list">

              {notifications.length === 0 && (
                <p className="empty-text">No notifications</p>
              )}

              {notifications.map(n => (

                <div
                  key={n.id}
                  className={`notification-item ${n.viewed ? "read" : ""}`}
                >

                  <div>

                    <p className="notif-title">

                      {n.status === "APPROVED"
                        ? "Request Approved"
                        : "Request Rejected"}

                    </p>

                    <span className="notif-msg">
                      {n.message}
                    </span>

                  </div>

                  {!n.viewed && (

                    <button
                      className="read-btn"
                      onClick={() => markAsRead(n.id)}
                    >
                      Read
                    </button>

                  )}

                </div>

              ))}

            </div>

          </div>

        </div>

      )}

    </div>

  );
}
