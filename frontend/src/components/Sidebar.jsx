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
        <button onClick={() => go("/")}>Dashboard</button>
        <button onClick={() => go("/books")}>Books</button>
        <button onClick={() => go("/add-book")}>Add Book</button>
        <button onClick={() => go("/students")}>Students</button>
        <button onClick={() => go("/issue")}>Issue</button>
        <button onClick={() => go("/reservations")}>Reservations</button>
        <button onClick={() => go("/return")}>Return</button>
        <button onClick={() => go("/admin-profile")}>Profile</button>
        <button onClick={() => go("/issued")}>Issued List</button>

        {/* 🔴 Logout Button */}
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}
