import { useEffect, useRef, useState } from "react";
import logo from "../assets/logo.png";
import "./Topbar.css";
import { showToast } from "../../public/toast";
import {
  getAdminNotifications,
  approveBookRequest,
  rejectBookRequest
} from "../api";


export default function Topbar({ open, setOpen }) {

  const today = new Date().toLocaleDateString();

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  // 🔔 notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // 🌙 theme
  useEffect(() => {
    if (theme === "light") document.body.classList.add("light");
    else document.body.classList.remove("light");

    localStorage.setItem("theme", theme);
  }, [theme]);

  // 🔔 fetch notifications
  useEffect(() => {

    const loadNotifications = async () => {
      try {
        const data = await getAdminNotifications();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Notification fetch error", e);
      }
    };

    loadNotifications();
    const timer = setInterval(loadNotifications, 10000);
    return () => clearInterval(timer);

  }, []);

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ ACCEPT REQUEST
  const acceptRequest = async (id) => {
    try {
      const msg = await approveBookRequest(id, 14);
      showToast(msg, "success");

      setNotifications(prev =>
        prev.filter(n => n.id !== id)
      );
    } catch (e) {
      console.error(e);
      showToast("Failed to approve request", "error");
    }
  };

   const rejectRequest = async (id) => {
    try {
      const msg = await rejectBookRequest(id);
  
      showToast(msg, "success");
  
      setNotifications(prev =>
        prev.filter(n => n.id !== id)
      );
  
    } catch (e) {
      console.error(e);
      showToast("Failed to reject request", "error");
    }
  };
  const toggleTheme = () => {
    setTheme(p => (p === "dark" ? "light" : "dark"));
  };

  return (
    <div className={`topbar ${open ? "shifted" : ""}`}>

      <div className="left">
        <button
          className={`menuBtn ${open ? "active" : ""}`}
          onClick={() => setOpen(o => !o)}
        >
          <span></span><span></span><span></span>
        </button>

        <div className="brand">
          <img src={logo} alt="Library Logo" className="logo1" />
          <span className="brand-name">Book Nexa</span>
        </div>
      </div>

      <div className="right">

        <span className="dashboard-date">Today : {today}</span>

        {/* 🔔 Notification */}
        <div className="notification-wrapper" ref={notifRef}>
          <button
            className="notification-btn"
            onClick={() => setShowNotifications(s => !s)}
          >
            🔔
            {notifications.length > 0 && (
              <span className="badge">{notifications.length}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-box">
              <h4>Book Requests</h4>

              {notifications.map(n => (
                <div key={n.id} className="notification-item">
                  <div className="notif-text">
                    📚 <b>{n.copyCode}</b> requested by
                    <b> {n.hallTicket}</b>
                    <br />
                    <small>
                      {new Date(n.time).toLocaleString()}
                    </small>
                  </div>

                  <div className="notif-actions">
                    <button
                      className="accept-btn"
                      onClick={() => acceptRequest(n.id)}
                    >
                      Accept
                    </button>

                    <button
                      className="reject-btn"
                      onClick={() => rejectRequest(n.id)}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <p className="no-notifications">
                  No new requests
                </p>
              )}
            </div>
          )}
        </div>

        {/* 🌙 Theme */}
        <button className="themeToggleBtn" onClick={toggleTheme}>
          {theme === "dark" ? "🌙" : "☀️"}
        </button>

      </div>
    </div>
  );
}
