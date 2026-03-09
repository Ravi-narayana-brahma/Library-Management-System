import { useEffect, useState } from "react";
import "./Table.css";
import { useNavigate } from "react-router-dom";
import { getAllIssuedBooks } from "../api";

export default function IssuedList() {

  const [list, setList] = useState([]);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [fineStatusFilter, setFineStatusFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    loadIssued();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, fineStatusFilter, fromDate, toDate]);

  async function loadIssued() {
    try {
      const data = await getAllIssuedBooks();
      setList(data);
    } catch (e) {
      console.log("Issued list error", e);
    }
  }

  // 🔎 FILTER LOGIC
  const filtered = list.filter(i => {

    const searchText = search.toLowerCase();

    const matchesSearch =
      i.bookCopyId?.book?.bookName?.toLowerCase().includes(searchText) ||
      i.student?.studentName?.toLowerCase().includes(searchText) ||
      i.bookCopyId?.copyCode?.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "ALL" ||
      i.recordStatus === statusFilter;

    const matchesFineStatus =
      fineStatusFilter === "ALL" ||
      i.fineStatus === fineStatusFilter;

    const issueDate = i.issueDate ? new Date(i.issueDate) : null;
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const matchesDate =
      (!from || issueDate >= from) &&
      (!to || issueDate <= to);

    return matchesSearch && matchesStatus && matchesFineStatus && matchesDate;
  });

  const sorted = [...filtered].sort(
    (a, b) => a.recordId - b.recordId
  );

  const totalPages = Math.ceil(sorted.length / pageSize);

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;

  const pageData = sorted.slice(start, end);

  function getPageNumbers(current, total) {

    if (total <= 1) return [1];

    const pages = [];
    const start = Math.max(2, current - 2);
    const end = Math.min(total - 1, current + 2);

    pages.push(1);

    if (start > 2) pages.push("...");

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < total - 1) pages.push("...");

    pages.push(total);

    const result = [];
    const seen = new Set();

    for (const p of pages) {
      if (p === "...") {
        if (result[result.length - 1] !== "...") {
          result.push(p);
        }
      } else {
        if (!seen.has(p)) {
          seen.add(p);
          result.push(p);
        }
      }
    }

    return result;
  }
  return (
    <div>

      <h2>Issued Books</h2>

      {/* CONTROLS */}
      <div className="table-controls">

        <div className="control-group">
          <input
            type="text"
            placeholder="Search book / student / copy..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="control-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="ISSUED">Issued</option>
            <option value="RETURNED">Returned</option>
            {/* <option value="LOST">Lost</option>
            <option value="DAMAGED">Damaged</option> */}
          </select>
        </div>

        <div className="control-group">
          <select
            value={fineStatusFilter}
            onChange={(e) => setFineStatusFilter(e.target.value)}
          >
            <option value="ALL">All Fine Status</option>
            <option value="NO_FINE">No Fine</option>
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
          </select>
        </div>

        <div className="control-group date-group">
          <label>From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="control-group date-group">
          <label>To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <button
          className="clear-btn"
          onClick={() => {
            setSearch("");
            setStatusFilter("ALL");
            setFineStatusFilter("ALL");
            setFromDate("");
            setToDate("");
          }}
        >
          Clear
        </button>

      </div>

      <div className="total-count">
        Total Records: <strong>{filtered.length}</strong>
      </div>

      {/* TABLE */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Record Id</th>
              <th>Book Name</th>
              <th>Book Copy</th>
              <th>Student</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Return Date</th>
              <th>Fine</th>
              <th>Balance</th>
              <th>Fine Status</th>
              <th>Status</th>
              <th>Pay</th>
            </tr>
          </thead>

          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan="12" style={{ textAlign: "center" }}>
                  No records found
                </td>
              </tr>
            ) : (
             {pageData.map(i => {

  const today = new Date();
  const dueDate = new Date(i.dueDate);

  const isOverdue =
    i.recordStatus === "ISSUED" && dueDate < today;

  return (
    <tr key={i.recordId}>
      <td>{i.recordId}</td>
      <td>{i.bookCopyId?.book?.bookName}</td>
      <td>{i.bookCopyId?.copyCode}</td>
      <td>{i.student?.studentName}</td>
      <td>{i.issueDate}</td>
      <td>{i.dueDate}</td>
      <td>{i.returnDate ?? "-"}</td>
      <td>{i.fine ?? 0}</td>
      <td>{i.balanceAmount ?? 0}</td>
      <td>{i.fineStatus ?? "-"}</td>

      <td>
        <span className={`status ${isOverdue ? "overdue" : (i.recordStatus || "").toLowerCase()}`}>
          {isOverdue ? "OVERDUE" : i.recordStatus}
        </span>
      </td>

      <td>
        {i.balanceAmount > 0 ? (
          <button
            className="pay-btn-row"
            onClick={() =>
              navigate("/admin/pay-fine", {
                state: {
                  issueId: i.recordId,
                  issuedTo: i.student?.studentName,
                  bookTitle: i.bookCopyId?.book?.bookName,
                  copyCode: i.bookCopyId?.copyCode,
                  fine: i.fine ?? 0,
                  balanceAmount: i.balanceAmount ?? 0
                }
              })
            }
          >
            Pay
          </button>
        ) : "-"}
      </td>

    </tr>
  );

})}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="pagination">

        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p - 1)}
        >
          Prev
        </button>

        {getPageNumbers(currentPage, totalPages).map((p, i) =>
          p === "..." ? (
            <span key={i} className="dots">...</span>
          ) : (
            <button
              key={p}
              className={currentPage === p ? "active-page" : ""}
              onClick={() => setCurrentPage(p)}
            >
              {p}
            </button>
          )
        )}

        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage(p => p + 1)}
        >
          Next
        </button>

      </div>

    </div>
  );
}
