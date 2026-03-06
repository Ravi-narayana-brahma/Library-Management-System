import { useEffect, useState } from "react";
import "./Form.css";
import { getAllBooks, addBookWithCopies } from "../api";

export default function AddBook() {

  const [books, setBooks] = useState([]);
  const [mode, setMode] = useState("existing");
  const [popupMessage, setPopupMessage] = useState("");

  const [bookCode, setBookCode] = useState("");
  const [bookName, setBookName] = useState("");
  const [copies, setCopies] = useState("");

  useEffect(() => {
    loadBooks();
  }, []);

  async function loadBooks() {
    const data = await getAllBooks();
    setBooks(data);
  }

  function handleModeChange(e) {
    const m = e.target.value;
    setMode(m);

    setBookCode("");
    setBookName("");
    setCopies("");
  }

  function handleExistingSelect(e) {
    const code = e.target.value;
    setBookCode(code);

    const book = books.find(b => b.bookCode === code);
    if (book) {
      setBookName(book.bookName);
    } else {
      setBookName("");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!bookCode.trim() || !bookName.trim() || !copies) {
      setPopupMessage("Please fill all fields");
      return;
    }

    try {
      const msg = await addBookWithCopies({
        bookCode,
        bookName,
        numberOfCopies: Number(copies)
      });

      setPopupMessage(msg);

      setBookCode("");
      setBookName("");
      setCopies("");

      loadBooks();

    } catch (err) {
      setPopupMessage("Server error. Please try again.");
    }
  }
  function handleReset() {
    setBookCode("");
    setBookName("");
    setCopies("");
    setPopupMessage("");
  }
  return (
    <form className="form-box" onSubmit={handleSubmit}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Add Book (Existing or New)</h2>
        <button
          type="button"
          className="reset-btn"
          onClick={handleReset}
        >
          ↻
        </button>
      </div>


      {/* Mode Selection */}
      <div className="mode-row">
        <label>
          <input
            type="radio"
            value="existing"
            checked={mode === "existing"}
            onChange={handleModeChange}
          />
          Existing Book
        </label>

        <label style={{ marginLeft: "15px" }}>
          <input
            type="radio"
            value="new"
            checked={mode === "new"}
            onChange={handleModeChange}
          />
          New Book
        </label>
      </div>

      {/* Existing Book */}
      {mode === "existing" && (
        <>
          <select value={bookCode} onChange={handleExistingSelect}>
            <option value="">Select Book Code</option>
            {books.map(b => (
              <option key={b.bookCode} value={b.bookCode}>
                {b.bookCode}
              </option>
            ))}
          </select>

          <input
            placeholder="Book Name"
            value={bookName}
            readOnly
          />
        </>
      )}

      {/* New Book */}
      {mode === "new" && (
        <>
          <input
            placeholder="New Book Code"
            value={bookCode}
            onChange={(e) => setBookCode(e.target.value)}
          />

          <input
            placeholder="New Book Name"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
          />
        </>
      )}

      <input
        type="number"
        min="1"
        placeholder="Number of Copies"
        value={copies}
        onChange={(e) => setCopies(e.target.value)}
      />

      <button className="issue-btn" type="submit">
        Add Book with Copies
      </button>
      {popupMessage && (
        <div className="popup-overlay">
          <div className="popup-box">
            <p>{popupMessage}</p>
            <button
              onClick={() => setPopupMessage("")}
              className="popup-btn"
            >
              OK
            </button>
          </div>
        </div>
      )}

    </form>
  );
}
