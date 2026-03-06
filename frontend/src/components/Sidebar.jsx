import { useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { showToast } from "../../public/toast";   // ✅ import toast
import { logout } from "../api";

export default function Sidebar({ open, setOpen }) {
  const navigate = useNavigate();

  const go = (path) => {
    navigate(path);
    setOpen(false);
  };

  const logout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      navigate("/admin-login");
    }
  };


  return (
    <div
      className={`sidebar ${open ? "open" : ""}`}
      onClick={() => setOpen(false)}
    >
      <h2>🛠️ ADMIN</h2>

      <div
        className="sidebar-content"
        onClick={(e) => e.stopPropagation()}
      >
       <button onClick={() => go("/admin/dashboard")}>Dashboard</button>
        <button onClick={() => go("/admin/books")}>Books</button>
        <button onClick={() => go("/admin/add-book")}>Add Book</button>
        <button onClick={() => go("/admin/students")}>Students</button>
        <button onClick={() => go("/admin/issue")}>Issue</button>
        <button onClick={() => go("/admin/reservations")}>Reservations</button>
        <button onClick={() => go("/admin/return")}>Return</button>
        <button onClick={() => go("/admin/admin-profile")}>Profile</button>
        <button onClick={() => go("/admin/issued")}>Issued List</button>

        {/* 🔴 Logout Button */}
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}
