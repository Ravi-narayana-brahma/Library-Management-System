import { useEffect, useState, useRef } from "react";
import "./Form.css";
import { getAllBooks, issueBook, reserveBook } from "../api";
import { showToast } from "../../public/toast";

function SearchableDropdown({
  placeholder,
  items,
  value,
  onChange,
  labelKey,
  valueKey,
  disabled
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const boxRef = useRef();

  const selected = items.find(
    i => String(i[valueKey]) === String(value)
  );

  const filtered = items.filter(i =>
    String(i[labelKey])
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="dropdown-box" ref={boxRef}>
      <div
        className={`dropdown-head ${disabled ? "disabled" : ""}`}
        onClick={() => !disabled && setOpen(o => !o)}
      >
        {selected ? selected[labelKey] : placeholder}
      </div>

      {open && !disabled && (
        <div className="dropdown-panel">
          <input
            className="dropdown-search"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />

          <div className="dropdown-list">
            {filtered.map(i => (
              <div
                key={i[valueKey]}
                className="dropdown-item"
                onClick={() => {
                  onChange(i[valueKey]);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {i[labelKey]}
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="dropdown-empty">No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function IssueBook() {
  const [books, setBooks] = useState([]);
  const [issueDetails, setIssueDetails] = useState(null);
  const [bookId, setBookId] = useState("");
  const [copyId, setCopyId] = useState("");
  const [hallTicket, setHallTicket] = useState("");
  const [days, setDays] = useState("");

  useEffect(() => {
    getAllBooks()
      .then(setBooks)
      .catch(console.error);
  }, []);

  const selectedBook = books.find(
    b => String(b.bookId) === String(bookId)
  );

  // All copies sorted
  const allCopies =
    selectedBook?.copies
      ?.sort((a, b) =>
        String(a.copyCode).localeCompare(
          String(b.copyCode),
          undefined,
          { numeric: true, sensitivity: "base" }
        )
      ) || [];

  // Available copies
  const availableCopies = allCopies.filter(
    c => c.status === "AVAILABLE"
  );
  useEffect(() => {
    if (bookId && availableCopies.length === 0) {
      showToast("No copies available. You can reserve this book.", "warning");
    }
  }, [bookId, availableCopies.length]);

  // Issued copies
  const issuedCopies = allCopies.filter(
    c => c.status === "ISSUED"
  );

  // Decide which copies to show
  const dropdownCopies =
    availableCopies.length > 0
      ? availableCopies
      : issuedCopies;

  async function reserveSelectedBook() {
    if (!bookId || !hallTicket) {
      showToast("Select book and enter student ID first", "warning");
      return;
    }

    const msg = await reserveBook(bookId, hallTicket);
    showToast(msg, "success");
  }

async function handleIssue() {

  if (availableCopies.length === 0) {
    showToast("No copies available. Please reserve.", "warning");
    return;
  }

  if (!copyId || !hallTicket || !days) {
    showToast("Please select copy, student and days", "warning");
    return;
  }

  try {
    const msg = await issueBook(copyId, hallTicket, days);

    showToast(msg, msg.toLowerCase().includes("issued") ? "success" : "warning");

    // ❌ STOP if issue failed
    if (!msg.toLowerCase().includes("book issued")) {
      return;
    }

    // ✅ ONLY SUCCESS CASE CONTINUES
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(issueDate.getDate() + Number(days));

    setIssueDetails({
      book: selectedBook?.bookName,
      copy: dropdownCopies.find(
        c => String(c.copyId) === String(copyId)
      )?.copyCode,
      hallTicket,
      issueDate,
      dueDate
    });

    setBookId("");
    setCopyId("");
    setHallTicket("");
    setDays("");

  } catch (e) {
    console.log("Issue book error", e);
    showToast("Error issuing book", "error");
  }
}
  function handleReset() {
    setBookId("");
    setCopyId("");
    setHallTicket("");
    setDays("");
    setIssueDetails(null);
  }

  return (
    <div className="form-box">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Issue Book</h2>
        <button
          type="button"
          className="reset-btn"
          onClick={handleReset}
        >
          ↻
        </button>
      </div>
      <SearchableDropdown
        placeholder="Select Book"
        items={books.map(b => ({
          ...b,
          label: `${b.bookName} (${b.bookCode})`
        }))}
        labelKey="label"
        valueKey="bookId"
        value={bookId}
        onChange={(id) => {
          setBookId(id);
          setCopyId("");
        }}
      />

      {/* Copy Dropdown */}
      <SearchableDropdown
        placeholder="Select Copy"
        items={dropdownCopies.map(c => ({
          ...c,
          label:
            availableCopies.length > 0
              ? c.copyCode
              : `${c.copyCode} (Issued)`

        }))}
        labelKey="label"
        valueKey="copyId"
        value={copyId}
        onChange={setCopyId}
        disabled={!bookId}
      />

      {/* Reserve button only when no available copies */}
      {bookId && availableCopies.length === 0 && (
        <button
          type="button"
          className="reserve-btn"
          onClick={reserveSelectedBook}
        >
          Reserve this book
        </button>
      )}

      <input
        placeholder="Hall Ticket Number"
        value={hallTicket}
        onChange={e => setHallTicket(e.target.value)}
      />


      <input
        placeholder="Days"
        type="number"
        value={days}
        onChange={e => setDays(e.target.value)}
      />

      <button className="issue-btn" onClick={handleIssue}>Issue</button>

      {issueDetails && (
        <div className="return-details-box">
          <h3>Issue Details</h3>

          <div className="rd-row">
            <span>Book</span>
            <span>{issueDetails.book}</span>
          </div>

          <div className="rd-row">
            <span>Copy</span>
            <span>{issueDetails.copy}</span>
          </div>

          <div className="rd-row">
            <span>Student ID</span>
            <span>{issueDetails.hallTicket}</span>
          </div>

          <div className="rd-row">
            <span>Issued On</span>
            <span>{issueDetails.issueDate.toLocaleDateString()}</span>
          </div>

          <div className="rd-row">
            <span>Due Date</span>
            <span>{issueDetails.dueDate.toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
