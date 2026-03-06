import { useEffect, useState } from "react";
import "./Table.css";
import CopiesTable from "./CopiesTable";
import { getAllBooks, getBookHistory } from "../api";

export default function Books() {

  const [bookHistory, setBookHistory] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllBooks()
      .then(data => setBooks(data))
      .catch(err => console.log(err));
  }, []);

  const filteredBooks = [...books]
    .sort((a, b) => a.bookId - b.bookId)
    .filter(b =>
      b.bookId?.toString().includes(search) ||
      b.bookCode?.toLowerCase().includes(search.toLowerCase()) ||
      b.bookName?.toLowerCase().includes(search.toLowerCase())
    );

  async function loadBookHistory(id) {
    const data = await getBookHistory(id);
    setBookHistory(data);
  }

  if (!selectedBook) {

    return (
      <div className="books-page">

        <div className="table-card">

          <div className="table-header">
            <h2>Books</h2>

            <span className="table-count">
              Total : {filteredBooks.length}
            </span>
          </div>

          {/* Search */}
          <div className="table-search">
            <input
              type="text"
              placeholder="Search by id, code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="table-wrap">
            <table className="data-table">

              <thead>
                <tr>
                  <th>Book Id</th>
                  <th>Book Code</th>
                  <th>Book Name</th>
                  <th>Total</th>
                  <th>Available</th>
                  <th>Copies</th>
                  <th>History</th>
                </tr>
              </thead>

              <tbody>
                {filteredBooks.map(b => (
                  <tr
                    key={b.bookId}
                    className="click-row"
                    onClick={() => setSelectedBook(b)}
                  >
                    <td>{b.bookId}</td>
                    <td>{b.bookCode}</td>
                    <td>{b.bookName}</td>
                    <td>{b.totalCopies}</td>
                    <td>{b.availableCopies}</td>
                    <td className="view-text">View</td>
                    <td
                      className="view-text history-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        loadBookHistory(b.bookId);
                      }}
                    >
                      History
                    </td>
                  </tr>
                ))}

                {filteredBooks.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>
                      No books found
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>

          {/* Book history panel */}
          {bookHistory.length > 0 && (
            <div className="table-wrap" style={{ marginTop: 20 }}>

              <div className="panel-header">
                <h3>Book History</h3>

                <button
                  className="close-btn"
                  onClick={() => setBookHistory([])}
                >
                  ✕
                </button>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Copy Code</th>
                    <th>Issue</th>
                    <th>Return</th>
                  </tr>
                </thead>

                <tbody>
                  {bookHistory.map(r => (
                    <tr key={r.recordId}>
                      <td>{r.student?.studentName}</td>
                      <td>{r.bookCopyId?.copyCode}</td>
                      <td>{r.issueDate}</td>
                      <td>{r.returnDate ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          )}

        </div>

      </div>
    );
  }

  /* --------------------------------
     COPIES VIEW
  -------------------------------- */

  return (
    <div className="books-page">

      <div className="table-card">

        <div className="table-header">
          <h2>
            Copies – {selectedBook.bookName}
          </h2>

          <button
            className="back-btn1"
            onClick={() => setSelectedBook(null)}
          >
            ← Back to books
          </button>
        </div>

        <div className="table-wrap">
          <CopiesTable
            copies={selectedBook.copies}
            onStatusChange={(copyId, newStatus) => {

              setSelectedBook(prev => ({
                ...prev,
                copies: prev.copies.map(c =>
                  c.copyId === copyId
                    ? { ...c, status: newStatus }
                    : c
                )
              }));

            }}
          />
        </div>

      </div>

    </div>
  );
}
