import { useEffect, useState } from "react";
import { showToast } from "../../../public/toast";
import "./Student.css";
import { useOutletContext } from "react-router-dom";
import { getStudentDashboard } from "../../api";

export default function StudentDashboard() {

  const [data, setData] = useState(null);
  const { studentName } = useOutletContext();
  const today = new Date().toLocaleDateString();

  async function loadDashboard() {
    try {
      const data = await getStudentDashboard();
      setData(data);
    } catch (e) {
      console.error(e);
      showToast("Failed to load dashboard", "error");
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (!data) {
    return <div className="empty-state">Loading dashboard...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="student-page-header1">
        <div className="student-page-header">
          <h1 className="h1">
            Welcome Back, <span className="student-name">{studentName}</span> 👋
          </h1>
          <span>Your Library Overview</span>
        </div>
        <span className="dashboard-date">Today : {today}</span>
      </div>
      {/* Stats */}
      <div className="student-cards">
        <div className="student-card">
          <h3>Issued Books</h3>
          <p>{data.issuedCount}</p>
        </div>

        <div className="student-card">
          <h3>Due Soon</h3>
          <p>{data.dueSoon}</p>
        </div>

        <div className="student-card">
          <h3>Pending Fine</h3>
          <p>₹{data.pendingFine}</p>
        </div>

        <div className="student-card">
          <h3>Reservations</h3>
          <p>{data.reservations}</p>
        </div>
      </div>

      {/* Recent Issued */}
      <div className="student-page-header" style={{ marginTop: 35 }}>
        <h1>Recently Issued Books</h1>
        <span>Last 3 records</span>
      </div>

      {data.recentIssued.length > 0 ? (
        <table className="student-table">
          <thead>
            <tr>
              <th>Book Name</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.recentIssued.map((r, i) => (
              <tr key={i}>
                <td>{r.bookName}</td>
                <td>{r.issueDate}</td>
                <td>{r.dueDate}</td>
                <td>
                  <span
                    className={`badge ${r.status === "Overdue"
                      ? "red"
                      : "green"
                      }`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">No issued books yet</div>
      )}

      {/* Alerts */}
      {data.overdue > 0 && (
        <div className="empty-state" style={{ marginTop: 30 }}>
          ⚠️ You have <strong>{data.overdue}</strong> overdue book(s).
          Please return them to avoid extra fine.
        </div>
      )}
    </div>
  );
}
