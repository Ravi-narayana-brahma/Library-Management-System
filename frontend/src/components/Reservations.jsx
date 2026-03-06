import { useEffect, useState, useMemo } from "react";
import "./Table.css";
import { getReservations } from "../api";

export default function Reservations() {

  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await getReservations();
    setList(data);
  }

  // ✅ filter
  const filtered = useMemo(() => {

    const key = search.toLowerCase();

    return list.filter(r =>
      r.reservationId?.toString().includes(key) ||
      r.student?.studentName?.toLowerCase().includes(key) ||
      r.book?.bookName?.toLowerCase().includes(key) ||
      r.status?.toLowerCase().includes(key)
    );

  }, [list, search]);

  // ✅ pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const start = (page - 1) * pageSize;
  const pageData = filtered.slice(start, start + pageSize);


  function getPageNumbers(current, total, window = 2) {

    const pages = [];
    const start = Math.max(1, current - window);
    const end = Math.min(total, current + window);

    if (start > 1) pages.push(1);
    if (start > 2) pages.push("...");

    for (let i = start; i <= end; i++) pages.push(i);

    if (end < total - 1) pages.push("...");
    if (end < total) pages.push(total);

    return pages;
  }

  return (
    <div>

      <h2>Book Reservations</h2>

      <div className="table-search" style={{ display: "flex", gap: 10 }}>

        <input
          type="text"
          placeholder="Search by id, student, book or status..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>


      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Reservation Id</th>
              <th>Student</th>
              <th>Book</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {pageData.map(r => (
              <tr key={r.reservationId}>
                <td>{r.reservationId}</td>
                <td>{r.student?.studentName}</td>
                <td>{r.book?.bookName}</td>
                <td>{r.reservationDate}</td>
                <td>
                  <span className={`status ${(r.status || "").toLowerCase()}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}

            {pageData.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No reservations
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      {filtered.length > 0 && (
        <div className="pagination">


          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Prev
          </button>

          {getPageNumbers(page, totalPages).map((p, i) =>
            p === "..." ? (
              <span key={i} className="dots">...</span>
            ) : (
              <button
                key={p}
                className={page === p ? "active-page" : ""}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            )
          )}

          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            style={{ padding: "6px 8px" }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          {/* jump to page */}
          <span className="jump-box">
            Go :
            <input
              type="number"
              min="1"
              max={totalPages}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const v = Number(e.target.value);
                  if (v >= 1 && v <= totalPages) {
                    setPage(v);
                  }
                }
              }}
            />
          </span>

        </div>
      )}

    </div>
  );
}
