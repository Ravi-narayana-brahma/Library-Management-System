import { useEffect, useState } from "react";
import { showToast } from "../../../public/toast";
import { getStudentFines } from "../../api";

export default function Fines() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function loadFines() {
    try {
      setLoading(true);

      const data = await getStudentFines();
      setFines(data);
    } catch (e) {
      console.error(e);
      showToast("Failed to load fines", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFines();
  }, []);

  // 🔍 Search filter
  const filteredFines = fines.filter(f =>
    f.book?.toLowerCase().includes(search.toLowerCase())
  );

  // 💰 Calculations
  const totalPending = fines
    .filter(f => f.status === "Pending")
    .reduce((sum, f) => sum + f.amount, 0);

  const totalPaid = fines
    .filter(f => f.status === "Paid")
    .reduce((sum, f) => sum + f.amount, 0);

  const totalFine = fines.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div>
      {/* Header */}
      <div className="student-page-header">
        <h1 className="h1">💰 My Fines</h1>
        <span>View your fine details</span>
      </div>

      {/* Summary Cards */}
      <div className="student-cards">
        <div className="student-card">
          <h3>Total Fine</h3>
          <p>₹{totalFine}</p>
        </div>

        <div className="student-card">
          <h3>Total Pending</h3>
          <p style={{ color: "red" }}>₹{totalPending}</p>
        </div>

        <div className="student-card">
          <h3>Total Paid</h3>
          <p style={{ color: "green" }}>₹{totalPaid}</p>
        </div>
      </div>

      {/* 🔍 Search */}
      <div className="mybooks-controls">
        <input
          type="text"
          placeholder="Search by book name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="empty-state">Loading fines...</div>
      )}

      {/* Table */}
      {!loading && filteredFines.length > 0 ? (
        <table className="student-table">
          <thead>
            <tr>
              <th>Sl No</th>
              <th>Book Name</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredFines.map((f, index) => (
              <tr key={f.id}>
                <td>{index + 1}</td>

                <td>{f.book}</td>

                <td>
                  {formatDate(f.date)}
                </td>

                <td>
                  ₹{f.amount}
                </td>

                <td>
                  <span
                    className={`badge ${f.status === "Paid" ? "green" : "red"
                      }`}
                  >
                    {f.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && (
          <div className="empty-state">
            🎉 No fines available.
          </div>
        )
      )}
    </div>
  );
}

/* 📅 Date Formatter */
function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}