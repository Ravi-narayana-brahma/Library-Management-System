import { useEffect, useState } from "react";
import { showToast } from "../../../public/toast";
import "./Student.css";
import {
  getBooks,
  getCopiesByBook,
  requestBookCopy
} from "../../api";


export default function AllBooks() {

  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [days, setDays] = useState("");

  // modal + copies state
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState("");
  const [copies, setCopies] = useState([]);
  const [copySearch, setCopySearch] = useState("");

  // 🔹 fetch books
  useEffect(() => {
    getBooks()
      .then(setBooks)
      .catch(console.error);
  }, []);

  // 🔹 SORT BOOKS (A → Z by Book Name)
  const sortedBooks = [...books].sort((a, b) =>
    a.bookName.localeCompare(b.bookName)
  );

  // 🔹 FILTER BOOKS
  const filteredBooks = sortedBooks.filter(b =>
    b.bookName.toLowerCase().includes(search.toLowerCase()) ||
    b.bookCode.toLowerCase().includes(search.toLowerCase())
  );

  // 🔹 open modal & load copies
  const openCopiesModal = async (book) => {
    try {
      const data = await getCopiesByBook(book.bookId);

      // ONLY AVAILABLE COPIES + SORT
      const availableSorted = Array.isArray(data)
        ? data
          .filter(c => c.status === "AVAILABLE")
          .sort((a, b) =>
            a.copyCode.localeCompare(b.copyCode, undefined, {
              numeric: true,
              sensitivity: "base"
            })
          )
        : [];

      setCopies(availableSorted);

      setSelectedBook(book.bookName);
      setCopySearch("");
      setDays("");
      setShowModal(true);

    } catch (err) {
      console.error(err);
      setCopies([]);
      setShowModal(true);
    }
  };

  // 🔹 FILTER COPIES
  const filteredCopies = copies.filter(c =>
    c.copyCode.toLowerCase().includes(copySearch.toLowerCase())
  );

  // 🔹 send request to admin
  const requestCopy = async (copy) => {
  if (!days || days <= 0 || days > 30) {
    showToast("Please enter valid days (1–30)", "warning");
    return;
  }

  try {
    const msg = await requestBookCopy(copy.book.bookId, copy.copyCode, days);
    showToast(msg, "success");
    setShowModal(false);
  } catch (err) {
    showToast("Request failed. Try again.", "error");
  }
};

  return (
    <div>

      {/* HEADER */}
      <div className="student-page-header">
        <h1 className="h1">📚 All Books</h1>
        <span>Library book catalog</span>
      </div>

      {/* SEARCH */}
      <div className="mybooks-controls">
        <input
          type="text"
          placeholder="Search book..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* BOOKS TABLE */}
      <table className="student-table">
        <thead>
          <tr>
            <th>Sl No</th>
            <th>Code</th>
            <th>Name</th>
            <th>Total</th>
            <th>Available</th>
            <th>Copies</th>
          </tr>
        </thead>

        <tbody>
          {filteredBooks.map((book, index) => (
            <tr key={book.bookId}>
              <td>{index + 1}</td>
              <td>{book.bookCode}</td>
              <td>{book.bookName}</td>
              <td>{book.totalCopies}</td>
              <td>{book.availableCopies}</td>
              <td>
                <button
                  className="copies-btn"
                  disabled={book.availableCopies === 0}
                  onClick={() => openCopiesModal(book)}
                >
                  Available Copies
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🔹 MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">

            <div className="modal-header">
              <h3>{selectedBook} - Available Copies</h3>
              <button onClick={() => setShowModal(false)}>✖</button>
            </div>

            {/* COPY SEARCH */}
            <input
              className="copy-search"
              placeholder="Search copy..."
              value={copySearch}
              onChange={e => setCopySearch(e.target.value)}
            />

            {/* DAYS INPUT */}
            <input
              type="number"
              min="1"
              max="30"
              className="copy-search"
              placeholder="Enter days (1–30)"
              value={days}
              onChange={e => setDays(e.target.value)}
            />

            {/* COPIES LIST */}
            <div className="copies-list">
              {filteredCopies.map((copy, index) => (
                <div key={copy.copyId} className="copy-row">
                  <span>{index + 1}. {copy.copyCode}</span>

                  <button
                    className="request-btn"
                    disabled={!days}
                    onClick={() => requestCopy(copy)}
                  >
                    Request
                  </button>
                </div>
              ))}

              {filteredCopies.length === 0 && (
                <p>No copies available</p>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
