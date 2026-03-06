const BASE_URL = "https://library-management-system-241n.onrender.com";

/* ================= AUTH ================= */

export const studentLogin = async (username, password) => {
  const res = await fetch(`${BASE_URL}/api/auth/student/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const adminLogin = async (username, password) => {
  const res = await fetch(`${BASE_URL}/api/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const adminRegister = async (username, email, password) => {
  const res = await fetch(`${BASE_URL}/api/auth/admin/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password })
  });

  return res.json();
};

export const logout = async () => {
  const res = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include"
  });

  return res.json();
};

/* ================= AUTH ================= */

export const getCurrentUser = async () => {
  try {

    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      credentials: "include"
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data;

  } catch (err) {
    return null;
  }
};

export const whoAmI = getCurrentUser;

export const forgotPassword = async (email) => {
  const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  return res.json();
};

export const verifyOtp = async (email, otp) => {
  const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp })
  });

  return res.json();
};

export const resetPassword = async (email, password) => {
  const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  return res.json();
};

export const getStudentProfile = async () => {
  const res = await fetch(`${BASE_URL}/api/auth/student/profile`, {
    credentials: "include"
  });

  return res.json();
};

export const getAdminProfile = async () => {
  const res = await fetch(`${BASE_URL}/api/auth/admin/profile`, {
    credentials: "include"
  });

  return res.json();
};


/* ================= BOOKS ================= */

export const getBooks = async () => {
  const res = await fetch(`${BASE_URL}/library/books`);
  return res.json();
};

export const addBookWithCopies = async (book) => {
  const res = await fetch(`${BASE_URL}/library/book/with-copies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book)
  });

  return res.text();
};

export const getBookHistory = async (bookId) => {
  const res = await fetch(`${BASE_URL}/library/books/${bookId}/history`);
  return res.json();
};


/* ================= COPIES ================= */

export const getCopiesByBook = async (bookId) => {
  const res = await fetch(`${BASE_URL}/library/copies/by-book?bookId=${bookId}`);
  return res.json();
};

export const searchCopyCodes = async (key) => {
  const res = await fetch(`${BASE_URL}/library/copies/search?key=${key}`);
  return res.json();
};

export const markCopyStatus = async (copyId, status) => {
  const res = await fetch(
    `${BASE_URL}/library/copy/mark-status?copyId=${copyId}&status=${status}`,
    { method: "POST" }
  );

  return res.json();
};

export const getLostDamagedBooks = async (bookName) => {
  let url = `${BASE_URL}/library/copies/lost-damaged`;

  if (bookName) {
    url += `?bookName=${encodeURIComponent(bookName)}`;
  }

  const res = await fetch(url);
  return res.json();
};


/* ================= STUDENTS ================= */

export const getStudents = async () => {
  const res = await fetch(`${BASE_URL}/library/students`);
  return res.json();
};

export const addStudent = async (student) => {

  const res = await fetch(`${BASE_URL}/library/student`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student)
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || "Failed to add student");
  }

  return text;
};

export const getStudentHistory = async (hallTicket) => {
  const res = await fetch(`${BASE_URL}/library/students/${hallTicket}/history`);
  return res.json();
};

export const getActiveStudentIssues = async (hallTicket) => {
  const res = await fetch(`${BASE_URL}/library/students/${hallTicket}/active-issues`);
  return res.json();
};


/* ================= ISSUE / RETURN ================= */

export const issueBook = async (copyId, hallTicket, days) => {
  const res = await fetch(`${BASE_URL}/library/issue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ copyId, hallTicket, days })
  });

  return res.text();
};

export const returnBook = async (copyCode) => {
  const res = await fetch(
    `${BASE_URL}/library/return-by-copy?copyCode=${copyCode}`,
    { method: "POST" }
  );

  return res.json();
};

export const payFine = async (issueId, amount) => {
  const res = await fetch(
    `${BASE_URL}/library/pay-fine?issueId=${issueId}&amount=${amount}`,
    { method: "POST" }
  );

  return res.json();
};

export const getAllIssuedBooks = async () => {
  const res = await fetch(`${BASE_URL}/library/issued`);
  return res.json();
};


/* ================= RESERVATIONS ================= */

export const reserveBook = async (value, hallTicket) => {

  let url = `${BASE_URL}/library/reserve`;
  const input = value.trim();

  if (/^\d+$/.test(input)) {
    // Book ID
    url += `?bookId=${encodeURIComponent(input)}&hallTicket=${encodeURIComponent(hallTicket)}`;
  } 
  else if (input.includes("-")) {
    // Copy Code
    url += `?copyCode=${encodeURIComponent(input)}&hallTicket=${encodeURIComponent(hallTicket)}`;
  } 
  else {
    // Book Code
    url += `?bookCode=${encodeURIComponent(input)}&hallTicket=${encodeURIComponent(hallTicket)}`;
  }

  const res = await fetch(url, {
    method: "POST",
    credentials: "include"
  });

  const data = await res.text();

  if (!res.ok) {
    throw new Error(data);
  }

  return data;
};
export const reserveBookStudent = async (value) => {

  const input = value.trim();

  let bookId = null;

  // 1️⃣ If user enters numeric → already bookId
  if (/^\d+$/.test(input)) {
    bookId = input;
  }

  // 2️⃣ If user enters copy code
  else if (input.includes("-")) {

    const res = await fetch(
      `${BASE_URL}/library/copies/search?key=${encodeURIComponent(input)}`
    );

    const copies = await res.json();

    if (!copies.length) {
      throw new Error("Copy not found");
    }

    bookId = copies[0].book.id;
  }

  // 3️⃣ If user enters book code
  else {

    const res = await fetch(
      `${BASE_URL}/library/books/search?key=${encodeURIComponent(input)}`
    );

    const books = await res.json();

    if (!books.length) {
      throw new Error("Book not found");
    }

    bookId = books[0].id;
  }

  // 4️⃣ Call reserve API
  const res = await fetch(
    `${BASE_URL}/library/student/reserve?bookId=${bookId}`,
    {
      method: "POST",
      credentials: "include"
    }
  );

  const msg = await res.text();

  if (!res.ok) throw new Error(msg);

  return msg;
};
export const getReservations = async () => {
  const res = await fetch(`${BASE_URL}/library/reservations`);
  return res.json();
};


/* ================= ADMIN DASHBOARD ================= */

export const getDashboardStats = async (fromDate, toDate) => {

  let url = `${BASE_URL}/library/dashboard`;

  if (fromDate && toDate) {
    url += `?from=${fromDate}&to=${toDate}`;
  }

  const res = await fetch(url);
  return res.json();
};

export const getRecentIssued = async () => {
  const res = await fetch(`${BASE_URL}/library/issued/recent`);
  return res.json();
};


/* ================= ADMIN NOTIFICATIONS ================= */

export const getAdminNotifications = async () => {
  const res = await fetch(`${BASE_URL}/library/admin/notifications`, {
    credentials: "include"
  });

  return res.json();
};

export const approveBookRequest = async (id, days) => {
  const res = await fetch(
    `${BASE_URL}/library/admin/requests/${id}/approve?days=${days}`,
    {
      method: "POST",
      credentials: "include"
    }
  );

  return res.text();
};

export const rejectBookRequest = async (id) => {
  const res = await fetch(
    `${BASE_URL}/library/admin/requests/${id}/reject`,
    {
      method: "POST",
      credentials: "include"
    }
  );

  return res.text();
};


/* ================= STUDENT SIDE ================= */

export const getStudentDashboard = async () => {
  const res = await fetch(`${BASE_URL}/library/student/dashboard`, {
    credentials: "include"
  });

  return res.json();
};

export const getStudentReturnHistory = async () => {
  const res = await fetch(`${BASE_URL}/library/student/return-history`, {
    credentials: "include"
  });

  return res.json();
};

export const getReservations = async () => {
  const res = await fetch(`${BASE_URL}/library/student/reservations`, {
    credentials: "include"
  });

  return res.json();
};

export const getStudentFines = async () => {
  const res = await fetch(`${BASE_URL}/library/student/fines`, {
    credentials: "include"
  });

  return res.json();
};

export const requestBookCopy = async (bookId, copyCode, days) => {

  const res = await fetch(
    `${BASE_URL}/library/student/request-copy?bookId=${bookId}&copyCode=${copyCode}&days=${days}`,
    {
      method: "POST",
      credentials: "include"
    }
  );

  const msg = await res.text();

  if (!res.ok) {
    throw new Error(msg || "Request failed");
  }

  return msg;
};

export const requestReturnBook = async (recordId, copyCode) => {
  const res = await fetch(
    `${BASE_URL}/library/student/request-return?recordId=${recordId}&copyCode=${copyCode}`,
    {
      method: "POST",
      credentials: "include"
    }
  );

  return res.text();
};

export const getStudentNotifications = async () => {
  const res = await fetch(`${BASE_URL}/library/student/notifications`, {
    credentials: "include"
  });

  return res.json();
};

export const markStudentNotificationRead = async (id) => {
  await fetch(
    `${BASE_URL}/library/student/notifications/${id}/read`,
    {
      method: "POST",
      credentials: "include"
    }
  );
};
/* ================= ALIASES FOR COMPONENT COMPATIBILITY ================= */

export const verifyOtpApi = verifyOtp;

export const getAllBooks = getBooks;

export const reserveBookFlexible = reserveBookStudent;

export const cancelStudentReservation = async (id) => {
  const res = await fetch(`${BASE_URL}/library/student/reservations/${id}`, {
    method: "DELETE",
    credentials: "include"
  });

  return res.json();
};
export const getStudentReservations = async () => {

  const res = await fetch(
    `${BASE_URL}/library/student/reservations`,
    {
      credentials: "include"
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to load reservations");
  }

  return data;
};
