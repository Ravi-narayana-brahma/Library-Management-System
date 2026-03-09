import { useState, useMemo } from "react";
import "./Table.css";
import { markCopyStatus } from "../api";

export default function CopiesTable({ copies, onStatusChange }) {

    const [search, setSearch] = useState("");

    // ✅ pagination states
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    if (!copies || copies.length === 0) {
        return <div className="copies-empty">No copies</div>;
    }

    async function markStatus(copyCode, status) {
        const data = await markCopyStatus(copyCode, status);
        onStatusChange(copyCode, data.newStatus);
    }

    // ✅ filter + sort
    const filtered = useMemo(() => {

        const sorted = [...copies].sort((a, b) => {
            const numA = parseInt((a.copyCode || "").match(/\d+/)?.[0] || 0, 10);
            const numB = parseInt((b.copyCode || "").match(/\d+/)?.[0] || 0, 10);
            return numA - numB;
        });

        if (!search.trim()) return sorted;

        return sorted.filter(c =>
            (c.copyCode || "").toLowerCase().includes(search.toLowerCase()) ||
            (c.status || "").toLowerCase().includes(search.toLowerCase())
        );

    }, [copies, search]);

    // ✅ total pages
    const totalPages = Math.ceil(filtered.length / pageSize);

    // ✅ reset page when search changes
    useMemo(() => {
        setPage(1);
    }, [search]);

    // ✅ paginated data
    const paginatedData = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, page]);
    const visiblePages = useMemo(() => {

        const maxButtons = 5;   // how many page buttons you want
        let start = Math.max(1, page - Math.floor(maxButtons / 2));
        let end = start + maxButtons - 1;

        if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, end - maxButtons + 1);
        }

        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;

    }, [page, totalPages]);


    return (
        <div className="copies-wrapper">

            <div className="table-top-bar">

                <div className="table-search">
                    <input
                        type="text"
                        placeholder="Search copy code or status..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="page-size-box">
                    <label>Rows:</label>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPage(1);   // very important
                        }}
                    >

                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>

            </div>


            <table className="copies-table">
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Copy Code</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {paginatedData.map((c, index) => (
                        <tr key={c.copyId || c.copyCode}>
                            {/* ✅ global serial number */}
                            <td>{(page - 1) * pageSize + index + 1}</td>

                            <td>{c.copyCode}</td>

                            <td>
                                <span className={`status ${(c.status || "").toLowerCase()}`}>
                                    {c.status}
                                </span>
                            </td>

                            <td>
                                {c.status !== "ISSUED" && (
                                    <select
                                        className="copy-action-select"
                                        value=""
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                markStatus(c.copyCode, e.target.value);
                                            }
                                        }}
                                    >
                                        <option value="">Change</option>

                                        {c.status !== "AVAILABLE" && (
                                            <option value="AVAILABLE">Mark Available</option>
                                        )}

                                        {c.status === "AVAILABLE" && (
                                            <>
                                                <option value="LOST">Mark Lost</option>
                                                <option value="DAMAGED">Mark Damaged</option>
                                            </>
                                        )}
                                    </select>
                                )}
                            </td>
                        </tr>
                    ))}

                    {paginatedData.length === 0 && (
                        <tr>
                            <td colSpan="4" style={{ textAlign: "center" }}>
                                No copies found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* ✅ Pagination UI */}
            {totalPages > 1 && (
                <div className="pagination">

                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        Prev
                    </button>

                    {visiblePages[0] > 1 && (
                        <>
                            <button onClick={() => setPage(1)}>1</button>
                            <span className="dots">...</span>
                        </>
                    )}

                    {visiblePages.map(p => (
                        <button
                            key={p}
                            className={page === p ? "active" : ""}
                            onClick={() => setPage(p)}
                        >
                            {p}
                        </button>
                    ))}

                    {visiblePages[visiblePages.length - 1] < totalPages && (
                        <>
                            <span className="dots">...</span>
                            <button onClick={() => setPage(totalPages)}>
                                {totalPages}
                            </button>
                        </>
                    )}

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next
                    </button>

                </div>
            )}


        </div>
    );
}
