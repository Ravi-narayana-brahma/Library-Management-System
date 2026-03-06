import { useEffect, useRef, useState } from "react";
import "./Dashboard.css";
import { getDashboardStats, getLostDamagedBooks } from "../api";

export default function LibraryDashboard() {

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [stats, setStats] = useState({
    totalBooks: 0,
    totalCopies: 0,
    availableCopies: 0,
    issuedCount: 0,
    totalStudents: 0,
    overdueCount: 0,
    todayIssued: 0,
    lostCopies: 0,
    damagedCopies: 0
  });

  const [recentIssued, setRecentIssued] = useState([]);
  const [bookName, setBookName] = useState("");
  const [lostDamagedGraph, setLostDamagedGraph] = useState([]);
  const [issuedGraph, setIssuedGraph] = useState([]);
  const [overdueGraph, setOverdueGraph] = useState([]);
  const [topBooksGraph, setTopBooksGraph] = useState([]);

  const issuedCanvasRef = useRef(null);
  const overdueCanvasRef = useRef(null);
  const topBooksCanvasRef = useRef(null);
  const lostCanvasRef = useRef(null);

  async function loadDashboard() {
    try {

      const data = await getDashboardStats(fromDate, toDate);

      setStats({
        totalBooks: data.stats?.totalBooks ?? 0,
        totalCopies: data.stats?.totalCopies ?? 0,
        availableCopies: data.stats?.availableCopies ?? 0,
        issuedCount: data.stats?.issuedCount ?? 0,
        totalStudents: data.stats?.totalStudents ?? 0,
        overdueCount: data.stats?.overdueCount ?? 0,
        todayIssued: data.stats?.todayIssued ?? 0,
        lostCopies: data.stats?.lostCopies ?? 0,
        damagedCopies: data.stats?.damagedCopies ?? 0
      });

      setRecentIssued(data.recentIssued ?? []);
      setIssuedGraph(data.issuedGraph ?? []);
      setOverdueGraph(data.overdueGraph ?? []);
      setTopBooksGraph(data.topBooks ?? []);

    } catch (e) {
      console.error("Dashboard load error", e);
    }
  }


  async function loadLostDamaged() {

    try {

      const data = await getLostDamagedBooks(bookName);

      const grouped = {};

      data.forEach(item => {
        if (!grouped[item.status]) {
          grouped[item.status] = 0;
        }
        grouped[item.status]++;
      });

      const graph = Object.keys(grouped).map(status => ({
        status,
        count: grouped[status]
      }));

      setLostDamagedGraph(graph);

    } catch (e) {
      console.error("Lost/Damaged load error", e);
    }
  }


  function applyQuickRange(days) {

    const to = new Date();
    const from = new Date();

    from.setDate(to.getDate() - (days - 1));

    setFromDate(from.toISOString().split("T")[0]);
    setToDate(to.toISOString().split("T")[0]);
  }


  function applyFilter() {

    loadDashboard();
    loadLostDamaged();

  }


  function clearFilter() {

    setFromDate("");
    setToDate("");
    setBookName("");

    loadDashboard();
    loadLostDamaged();

  }


  function drawDateChart(canvasRef, data) {

    const canvas = canvasRef.current;
    if (!canvas) return;   // ✅ FIX

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!data || data.length === 0) {
      ctx.font = "22px Arial";
      ctx.fillStyle = "#666";
      ctx.textAlign = "center";
      ctx.fillText("No Data", canvas.width / 2, canvas.height / 2);
      return;
    }

    const paddingLeft = 50;
    const paddingBottom = 30;
    const paddingTop = 20;

    const chartHeight = canvas.height - paddingTop - paddingBottom;
    const baseY = paddingTop + chartHeight;

    const max = Math.max(...data.map(d => d.count), 1);

    const barWidth = 40;
    const gap = 28;

    /* ---------- Y axis ---------- */
    ctx.beginPath();
    ctx.moveTo(paddingLeft, paddingTop);
    ctx.lineTo(paddingLeft, baseY);
    ctx.strokeStyle = "#555";
    ctx.stroke();

    /* ---------- X axis ---------- */
    ctx.beginPath();
    ctx.moveTo(paddingLeft, baseY);
    ctx.lineTo(canvas.width - 10, baseY);
    ctx.stroke();

    /* ---------- Y axis scale ---------- */
    const steps = 4;

    for (let i = 0; i <= steps; i++) {

      const value = Math.round((max / steps) * i);
      const y = baseY - (chartHeight / steps) * i;

      ctx.fillStyle = "#333";
      ctx.font = "11px Arial";
      ctx.fillText(value, 10, y + 4);

      ctx.beginPath();
      ctx.moveTo(paddingLeft - 4, y);
      ctx.lineTo(paddingLeft, y);
      ctx.stroke();
    }

    /* ---------- bars ---------- */

    data.forEach((d, i) => {

      const x = paddingLeft + 20 + i * (barWidth + gap);
      const h = (d.count / max) * chartHeight;
      const y = baseY - h;

      ctx.fillStyle = "#4f46e5";
      ctx.fillRect(x, y, barWidth, h);

      ctx.fillStyle = "#333";
      ctx.font = "11px Arial";
      ctx.fillText(d.count, x + 10, y - 6);
      ctx.fillText(d.date, x - 6, baseY + 15);
    });
    // ---- Axis titles ----

    // Y axis title
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = "12px Arial";
    ctx.fillStyle = "#333";
    ctx.fillText("Count", 0, 0);
    ctx.restore();

    // X axis title
    ctx.font = "12px Arial";
    ctx.fillStyle = "#333";
    ctx.fillText("Issue Date", canvas.width / 2 - 20, canvas.height - 5);

  }

  function drawTopBooksChart() {

    const canvas = topBooksCanvasRef.current;
    if (!canvas || !topBooksGraph || topBooksGraph.length === 0) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const paddingLeft = 50;
    const paddingBottom = 30;
    const paddingTop = 20;

    const chartHeight = canvas.height - paddingTop - paddingBottom;
    const baseY = paddingTop + chartHeight;

    const max = Math.max(...topBooksGraph.map(d => d.issueCount), 1);

    const barWidth = 40;
    const gap = 28;

    /* ---------- Y axis ---------- */
    ctx.beginPath();
    ctx.moveTo(paddingLeft, paddingTop);
    ctx.lineTo(paddingLeft, baseY);
    ctx.strokeStyle = "#555";
    ctx.stroke();

    /* ---------- X axis ---------- */
    ctx.beginPath();
    ctx.moveTo(paddingLeft, baseY);
    ctx.lineTo(canvas.width - 10, baseY);
    ctx.stroke();

    /* ---------- Y axis scale ---------- */
    const steps = 4;

    for (let i = 0; i <= steps; i++) {

      const value = Math.round((max / steps) * i);
      const y = baseY - (chartHeight / steps) * i;

      ctx.fillStyle = "#333";
      ctx.font = "11px Arial";
      ctx.fillText(value, 10, y + 4);

      ctx.beginPath();
      ctx.moveTo(paddingLeft - 4, y);
      ctx.lineTo(paddingLeft, y);
      ctx.stroke();
    }

    /* ---------- bars ---------- */

    topBooksGraph.forEach((d, i) => {

      const x = paddingLeft + 20 + i * (barWidth + gap);
      const h = (d.issueCount / max) * chartHeight;
      const y = baseY - h;

      ctx.fillStyle = "#16a34a";
      ctx.fillRect(x, y, barWidth, h);

      ctx.fillStyle = "#333";
      ctx.font = "10px Arial";
      ctx.fillText(d.issueCount, x + 10, y - 6);
      ctx.fillText(d.bookName.substring(0, 7), x - 6, baseY + 15);
    });
    // ---- Axis titles ----

    // Y axis title
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = "12px Arial";
    ctx.fillStyle = "#333";
    ctx.fillText("Issue Count", 0, 0);
    ctx.restore();

    ctx.font = "12px Arial";
    ctx.fillStyle = "#333";
    ctx.fillText("Book Name", canvas.width / 2 - 20, canvas.height - 5);

  }
  function drawStatusChart() {

    const canvas = lostCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // ALWAYS clear first
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (lostDamagedGraph.length === 0) {

      ctx.font = "22px Arial";
      ctx.fillStyle = "#666";
      ctx.textAlign = "center";
      ctx.fillText("No Lost / Damaged Books", canvas.width / 2, canvas.height / 2);

      return;
    }

    const centerX = 150;
    const centerY = 130;
    const radius = 100;

    const total = lostDamagedGraph.reduce((a, b) => a + b.count, 0);

    let startAngle = 0;

    lostDamagedGraph.forEach((item) => {

      const sliceAngle = (item.count / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();

      const color = item.status === "LOST" ? "#dc2626" : "#f97316";
      ctx.fillStyle = color;
      ctx.fill();

      const midAngle = startAngle + sliceAngle / 2;
      const textX = centerX + Math.cos(midAngle) * (radius / 1.5);
      const textY = centerY + Math.sin(midAngle) * (radius / 1.5);

      ctx.fillStyle = "#fff";
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "center";
      ctx.fillText(item.count, textX, textY);

      startAngle += sliceAngle;
    });

    // ✅ DRAW LEGEND
    const legendX = 300;
    let legendY = 40;

    lostDamagedGraph.forEach((item) => {

      const color = item.status === "LOST" ? "#dc2626" : "#f97316";

      // Draw small color box
      ctx.fillStyle = color;
      ctx.fillRect(legendX, legendY, 15, 15);

      // Draw text
      ctx.fillStyle = "#333";
      ctx.font = "22px Arial";
      ctx.textAlign = "left";
      ctx.fillText(item.status, legendX + 25, legendY + 12);

      legendY += 30;
    });
  }

  useEffect(() => {
    loadDashboard();
  }, [fromDate, toDate]);

  useEffect(() => {
    if (lostDamagedGraph.length > 0 && lostCanvasRef.current) {
      setTimeout(() => {
        drawStatusChart();
      }, 0);
    } else if (lostCanvasRef.current) {
      drawStatusChart();
    }
  }, [lostDamagedGraph]);


  useEffect(() => {
    drawDateChart(issuedCanvasRef, issuedGraph);
  }, [issuedGraph]);

  useEffect(() => {
    drawDateChart(overdueCanvasRef, overdueGraph);
  }, [overdueGraph]);

  useEffect(() => {
    drawTopBooksChart();
  }, [topBooksGraph]);
  useEffect(() => {
    loadLostDamaged();
  }, [bookName]);




  return (
    <div className="dashboard-container">

      <div className="dashboard-header">
        <h2 className="dashboard-title">Library Dashboard</h2>

      </div>

      <div className="filter-bar">

        <div>
          From :
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
          />
        </div>

        <div>
          To :
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
          />
        </div>

        <button onClick={applyFilter}>Apply</button>
        <button
          className="btn-clear-icon"
          onClick={clearFilter}
          title="Clear filter"
        >
          ×
        </button>
        <button onClick={() => applyQuickRange(3)}>Last 3 days</button>
        <button onClick={() => applyQuickRange(7)}>Last 7 days</button>
        <button onClick={() => applyQuickRange(30)}>Last 30 days</button>
        <div>
          <strong>Book :</strong>
          <input
            type="text"
            placeholder="Search book name"
            value={bookName}
            onChange={e => setBookName(e.target.value)}
          />
        </div>

      </div>


      <div className="dashboard-cards">

        <div className="dash-card blue">
          <span>Total Titles</span>
          <h3>{stats.totalBooks}</h3>
        </div>

        <div className="dash-card teal">
          <span>Total Books</span>
          <h3>{stats.totalCopies}</h3>
        </div>

        <div className="dash-card green">
          <span>Available Books</span>
          <h3>{stats.availableCopies}</h3>
        </div>

        <div className="dash-card orange">
          <span>Total Issued Books</span>
          <h3>{stats.issuedCount}</h3>
        </div>

        <div className="dash-card red">
          <span>Lost Books</span>
          <h3>{stats.lostCopies}</h3>
        </div>

        <div className="dash-card amber">
          <span>Damaged Books</span>
          <h3>{stats.damagedCopies}</h3>
        </div>

        <div className="dash-card purple">
          <span>Students</span>
          <h3>{stats.totalStudents}</h3>
        </div>

        <div className="dash-card crimson">
          <span>Overdue</span>
          <h3>{stats.overdueCount}</h3>
        </div>

        <div className="dash-card cyan">
          <span>Today Issued</span>
          <h3>{stats.todayIssued}</h3>
        </div>

      </div>


      <div className="dashboard-grid">

        <div className="dashboard-table-card">
          <h3>Issued Books Trend</h3>
          <canvas ref={issuedCanvasRef} width="600" height="260" className="chart-canvas"></canvas>
        </div>

        <div className="dashboard-table-card">
          <h3>Overdue Books Trend</h3>
          <canvas ref={overdueCanvasRef} width="600" height="260" className="chart-canvas"></canvas>
        </div>

        <div className="dashboard-table-card">
          <h3>Top Issued Books</h3>
          <canvas ref={topBooksCanvasRef} width="600" height="260" className="chart-canvas"></canvas>
        </div>
        <div className="dashboard-table-card">
          <h3>Lost and Damaged Books</h3>
          <canvas ref={lostCanvasRef} width="600" height="260" className="chart-canvas"></canvas>
        </div>

      </div>

      <div className="dashboard-table-card" style={{ marginTop: 20 }}>

        <h3>Recently Issued Books</h3>

        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Book Name</th>
              <th>Book Copy Code</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {
              recentIssued.length === 0 ?
                <tr><td colSpan="4" className="empty-row">No records</td></tr>
                :
                recentIssued.map((r, i) => (
                  <tr key={i}>
                    <td>{r.studentName}</td>
                    <td>{r.bookName}</td>
                    <td>{r.copyCode}</td>
                    <td>{r.issuedDate}</td>
                  </tr>
                ))
            }
          </tbody>
        </table>

      </div>

    </div>
  );
}
