import { useEffect, useState } from "react";
import { showToast } from "../../../public/toast";
import { useOutletContext } from "react-router-dom";
import {
  getStudentHistory,
  requestReturnBook
} from "../../api";

export default function IssuedBooks() {
  const { hallTicket } = useOutletContext();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // 🔁 Load books
  useEffect(() => {
    if (hallTicket) {
      loadHistoryBooks(hallTicket);
    }
  }, [hallTicket]);

  async function loadHistoryBooks(hallTicket) {
    try {
      setLoading(true);
      setError("");

      const data = await getStudentHistory(hallTicket);

      // ✅ ONLY ISSUED BOOKS
      const issuedOnly = (Array.isArray(data) ? data : []).filter(
        b => b.recordStatus === "ISSUED"
      );

      setBooks(issuedOnly);
    } catch (err) {
      console.error(err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  }

  async function requestReturn(recordId, copyCode) {
  try {
    const msg = await requestReturnBook(recordId, copyCode);

    showToast(msg, "success");   // ✅ instead of alert

    // 🔄 Refresh list after request
    loadHistoryBooks(hallTicket);

  } catch (error) {
    showToast("Return request failed", "error");
  }
}

  // 🔍 SEARCH FILTER
  const filteredBooks = books.filter(b =>
    b.bookCopyId?.book?.bookName
      ?.toLowerCase()
      .includes(search.toLowerCase()) ||
    b.bookCopyId?.copyCode
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      : "—";

  return (
    <div>
      {/* HEADER */}
      <div className="student-page-header">
        <h1 className="h1">📚 Issued Books</h1>
        <span>Currently issued books</span>
      </div>

      {/* SEARCH */}
      <div className="mybooks-controls">
        <input
          type="text"
          placeholder="Search book or copy code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading && <p>Loading issued books...</p>}
      {error && <div className="error-msg">{error}</div>}

      {!loading && !error && filteredBooks.length > 0 && (
        <table className="student-table">
          <thead>
            <tr>
              <th>Sl No</th>
              <th>Book Name</th>
              <th>Copy Code</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Fine</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredBooks.map((b, index) => (
              <tr key={b.recordId}>
                <td>{index + 1}</td>
                <td>{b.bookCopyId?.book?.bookName}</td>
                <td>{b.bookCopyId?.copyCode}</td>
                <td>{formatDate(b.issueDate)}</td>
                <td>{formatDate(b.dueDate)}</td>

                <td>
                  <span className="badge orange">ISSUED</span>
                </td>

                <td>
                  {b.fine > 0 ? (
                    <span style={{ color: "red", fontWeight: "bold" }}>
                      ₹{b.fine}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>

                <td>
                  <button
                    className="return-btn"
                    onClick={() =>
                      requestReturn(b.recordId, b.bookCopyId.copyCode)
                    }
                  >
                    Return
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && !error && filteredBooks.length === 0 && (
        <div className="empty-state">📚 No issued books</div>
      )}
    </div>
  );
}
