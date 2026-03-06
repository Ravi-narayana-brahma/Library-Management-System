import { useEffect, useState } from "react";
import { showToast } from "../../../public/toast";
import {
    getStudentReservations,
    reserveBookFlexible,
    cancelStudentReservation
} from "../../api";

export default function Reservations() {
    const [reservations, setReservations] = useState([]);
    const [input, setInput] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    // Load logged-in student's reservations
    async function loadReservations() {
        try {
            setLoading(true);

            const data = await getStudentReservations();
            setReservations(data);
        } catch (e) {
            console.error(e);
            showToast(e.message || "Failed to load reservations", "error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadReservations();
    }, []);

    // 🔁 FLEXIBLE RESERVE
    async function addReservation() {
        if (!input.trim()) {
            showToast("Enter Book ID / Book Code / Copy Code", "warning");
            return;
        }


        try {
            const msg = await reserveBookFlexible(input.trim());
            showToast(msg, "success");
            setInput("");
            loadReservations();
        } catch (e) {
            console.error(e);
            showToast("Reservation failed", "error");
        }
    }


    // Cancel reservation
    async function cancelReservation(id) {
        if (!window.confirm("Cancel this reservation?")) return;

        try {
            const msg = await cancelStudentReservation(id);

            showToast(msg || "Reservation cancelled", "info");
            loadReservations();
        } catch (e) {
            console.error(e);
            showToast("Cancel failed", "error");
        }
    }

    // Search filter
    const filteredReservations = reservations.filter(r =>
        r.book?.bookName
            ?.toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div>
            {/* Header */}
            <div className="student-page-header">
                <h1 className="h1">📌 My Reservations</h1>
                <span>Reserve using Book ID / Book Code / Copy Code</span>
            </div>

            {/* Flexible Reserve */}
            <div className="reservation-form">
                <input
                    placeholder="Book ID | Book Code | Copy Code (ex: 1 / JAVA / JAVA-003)"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                />
                <button onClick={addReservation}>Reserve</button>
            </div>

            {/* Search */}
            <div className="reservation-search">
                <input
                    placeholder="Search reservation..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Reservation List */}
            {loading ? (
                <div className="empty-state">Loading...</div>
            ) : filteredReservations.length > 0 ? (
                <table className="student-table">
                    <thead>
                        <tr>
                            <th>Sl No</th>
                            <th>Book Name</th>
                            <th>Reserved On</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReservations.map((res, index) => (
                            <tr key={res.reservationId}>
                                {/* ✅ SL NO */}
                                <td>{index + 1}</td>

                                {/* ✅ BOOK NAME */}
                                <td>{res.book?.bookName}</td>

                                {/* ✅ RESERVED DATE */}
                                <td>
                                    {new Date(res.reservationDate).toLocaleDateString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </td>

                                {/* ✅ STATUS */}
                                <td>
                                    <span
                                        className={`badge ${res.status === "ACTIVE" ? "orange" : "red"
                                            }`}
                                    >
                                        {res.status}
                                    </span>
                                </td>

                                {/* ✅ ACTION */}
                                <td>
                                    {res.status === "ACTIVE" ? (
                                        <button
                                            className="cancel-btn"
                                            onClick={() => cancelReservation(res.reservationId)}
                                        >
                                            Cancel
                                        </button>
                                    ) : (
                                        "—"
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="empty-state">
                    📌 No reservations found
                </div>
            )}
        </div>
    );
}
