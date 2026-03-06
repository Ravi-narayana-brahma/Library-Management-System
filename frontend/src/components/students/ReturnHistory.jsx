import { useEffect, useState } from "react";
import { showToast } from "../../../public/toast";
import { getStudentReturnHistory } from "../../api";
export default function ReturnHistory() {

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchReturnHistory();
  }, []);

  const fetchReturnHistory = async () => {
    try {
      const data = await getStudentReturnHistory();
      setHistory(data);

    } catch (error) {
      showToast("Server error", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 SEARCH FILTER (Book name)
  const filteredHistory = history.filter(h =>
    h.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>

      {/* Page Header */}
      <div className="student-page-header">
        <h1 className="h1">🔁 Return History</h1>
        <span>Previously returned books</span>
      </div>

      {/* 🔍 SEARCH */}
      <div className="mybooks-controls">
        <input
          type="text"
          placeholder="Search book..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="empty-state">Loading...</div>
      )}

      {/* Table */}
      {!loading && filteredHistory.length > 0 && (
        <table className="student-table">
          <thead>
            <tr>
              <th>Sl No</th>
              <th>Book Name</th>
              <th>Issue Date</th>
              <th>Return Date</th>
              <th>Fine</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredHistory.map((book, index) => (
              <tr key={book.id}>
                <td>{index + 1}</td>
                <td>{book.title}</td>
                <td>{formatDate(book.issueDate)}</td>
                <td>{formatDate(book.returnDate)}</td>
                <td>
                  {book.fine > 0 ? (
                    <strong style={{ color: "red" }}>
                      ₹{book.fine}
                    </strong>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  <span className="badge green">
                    {book.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Empty */}
      {!loading && filteredHistory.length === 0 && (
        <div className="empty-state">
          🔁 No return history available.
        </div>
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