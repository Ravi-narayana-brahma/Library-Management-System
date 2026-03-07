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

  // Core States
  const [hallTicket, setHallTicket] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar Toggle
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Auth Logic
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

  // Notifications Logic
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
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try { await logout(); } 
    catch (err) { console.error(err); } 
    finally { navigate("/student-login"); }
  };

  const markAsRead = async (id) => {
    try {
      await markStudentNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, viewed: true } : n));
    } catch (err) {
      console.error("Failed to mark notification:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.viewed).length;

  if (loading) return <p style={{ padding: 20 }}>Loading student...</p>;

  // Helper to navigate and close sidebar on mobile
  const menuNavigate = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  return (
    <div className="student-layout">
      
      {/* 📱 MOBILE TOGGLE BUTTON */}
      <button 
        className="sidebar-toggle-btn" 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? "✕" : "☰"}
      </button>

      {/* SIDEBAR OVERLAY (Mobile only) */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* SIDEBAR */}
      <aside className={`student-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="student-brand">
          <img src={logo} alt="Logo" className="student-brand-logo" />
          <div className="student-brand-text">
            <h1 className="student-brand-name">Book Nexa</h1>
            <span className="student-brand-tagline">Smart Library System</span>
          </div>
        </div>

        <div className="student-sidebar-header">
          <h2>🎓 Student</h2>
          <div className="notification-icon" onClick={() => setShowNotif(true)}>
            🔔 {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </div>
        </div>

        <nav className="student-menu">
          <button onClick={() => menuNavigate("/student/dashboard")}>Dashboard</button>
          <button onClick={() => menuNavigate("/student/all-books")}>All Books</button>
          <button onClick={() => menuNavigate("/student/issued")}>My Books</button>
          <button onClick={() => menuNavigate("/student/history")}>Return History</button>
          <button onClick={() => menuNavigate("/student/reservations")}>Reservations</button>
          <button onClick={() => menuNavigate("/student/fines")}>Fines</button>
          <button onClick={() => menuNavigate("/student/profile")}>Profile</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </nav>
      </aside>

      {/* PAGE CONTENT */}
      <main className="student-content">
        <Outlet context={{ hallTicket, studentName }} />
      </main>

      {/* NOTIFICATION MODAL (Logic remains the same) */}
      {showNotif && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Notifications</h3>
              <button onClick={() => setShowNotif(false)}>✖</button>
            </div>
            <div className="notification-list">
              {notifications.length === 0 && <p className="empty-text">No notifications</p>}
              {notifications.map(n => (
                <div key={n.id} className={`notification-item ${n.viewed ? "read" : ""}`}>
                  <div>
                    <p className="notif-title">{n.status === "APPROVED" ? "Approved" : "Rejected"}</p>
                    <span className="notif-msg">{n.message}</span>
                  </div>
                  {!n.viewed && <button className="read-btn" onClick={() => markAsRead(n.id)}>Read</button>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
