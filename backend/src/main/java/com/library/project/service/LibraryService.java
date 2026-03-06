package com.library.project.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.library.project.entity.*;
import com.library.project.repository.*;

import jakarta.transaction.Transactional;

@Service
public class LibraryService {

    @Autowired private BookRepository bookRepository;
    @Autowired private BookCopyRepository bookCopyRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private IssuedBookRepository issuedBookRepository;
    @Autowired private BookReservationRepository bookReservationRepository;
    @Autowired private BookRequestRepository bookRequestRepository;

    @Transactional
    public String addBookWithCopies(Book book) {

        try {

            int count = book.getNumberOfCopies();
            String bookCode = book.getBookCode().trim();

            Optional<Book> optionalBook =
                    bookRepository.findByBookCode(bookCode);

            Book savedBook;

            if (optionalBook.isPresent()) {
                savedBook = optionalBook.get();
            } else {
                book.setAvailableCopies(0);
                book.setTotalCopies(0);
                savedBook = bookRepository.save(book);
            }

            String baseCode = savedBook.getBookCode();
            int startIndex =
                    bookCopyRepository.countByBook(savedBook) + 1;

            for (int i = 0; i < count; i++) {

                String copyCode =
                        baseCode + "-" +
                        String.format("%03d", startIndex + i);

                BookCopy copy = new BookCopy();
                copy.setBook(savedBook);
                copy.setCopyCode(copyCode);
                copy.setStatus("AVAILABLE");

                bookCopyRepository.save(copy);
            }

            long newTotal =
                    savedBook.getTotalCopies() + count;
            long newAvailable =
                    savedBook.getAvailableCopies() + count;

            if (newAvailable > newTotal)
                newAvailable = newTotal;

            savedBook.setTotalCopies(newTotal);
            savedBook.setAvailableCopies(newAvailable);

            bookRepository.save(savedBook);

            return "Book copies added : " + count;

        } catch (Exception e) {
            e.printStackTrace();
            return "Error while adding book with copies";
        }
    }

    public List<Book> getAllBooks() {
        return bookRepository.findAllWithCopies();
    }

    public List<IssuedBook> getBookHistory(Long bookId) {

        Optional<Book> book =
                bookRepository.findById(bookId);

        if (book.isEmpty()) return List.of();

        return issuedBookRepository.findByBookId(bookId);
    }

    public String addStudent(Student student) {
        try {
            studentRepository.save(student);
            return "Student saved";
        } catch (Exception e) {
            e.printStackTrace();
            return "Error saving student";
        }
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public List<IssuedBook> getStudentHistory(String hallTicket) {

    Student student =
            studentRepository.findByHallTicket(hallTicket)
                    .orElseThrow(() ->
                            new RuntimeException("Student not found"));

    return issuedBookRepository
            .findByStudent_StudentIdOrderByIssueDateDesc(
                    student.getStudentId());
}


   public List<IssuedBook> getActiveIssuedBooksOfStudent(String hallTicket) {

    Student student =
            studentRepository.findByHallTicket(hallTicket)
                    .orElseThrow(() ->
                            new RuntimeException("Student not found"));

    return issuedBookRepository
            .findByStudent_StudentIdAndRecordStatusOrderByIssueDateDesc(
                    student.getStudentId(),
                    "ISSUED"
            );
}


    @Transactional
    public String issueBook(
            Long copyId,
            String hallTicket,
            int days) {


        try {

            BookCopy copy =
                    bookCopyRepository.findById(copyId)
                            .orElseThrow(() ->
                                    new RuntimeException("Copy not found"));

            if (!"AVAILABLE".equals(copy.getStatus()))
                return "Copy already issued";

            Student student =
            	    studentRepository.findByHallTicket(hallTicket)
            	        .orElseThrow(() ->
            	            new RuntimeException("Student not found"));

            long activeCount =
                    issuedBookRepository
                            .countByStudentAndRecordStatus(
                                    student, "ISSUED");

            if (activeCount >= 3)
                return "Maximum issued books reached";

            Book book = copy.getBook();

            copy.setStatus("ISSUED");

            IssuedBook issued = new IssuedBook();
            issued.setBookCopyId(copy);
            issued.setStudent(student);
            issued.setIssueDate(LocalDate.now());
            issued.setDueDate(LocalDate.now().plusDays(days));
            issued.setRecordStatus("ISSUED");
            issued.setFine(0.0);
            issued.setFineStatus("NO_FINE");

            book.setAvailableCopies(
                    book.getAvailableCopies() - 1);

            bookCopyRepository.save(copy);
            issuedBookRepository.save(issued);
            bookRepository.save(book);

            return "Book issued. Copy : "
                    + copy.getCopyCode();

        } catch (Exception e) {
            e.printStackTrace();
            return "Error issuing book";
        }
    }

    @Transactional
    public Map<String, Object>
    returnBookByCopyCode(String copyCode) {

        Map<String, Object> result = new HashMap<>();

        BookCopy copy =
                bookCopyRepository.findByCopyCode(copyCode)
                        .orElseThrow(() ->
                                new RuntimeException("Invalid copy"));

        IssuedBook issued =
                issuedBookRepository
                        .findTopByBookCopyIdAndRecordStatus(
                                copy, "ISSUED")
                        .orElseThrow(() ->
                                new RuntimeException("Already returned"));

        Book book = copy.getBook();

        long lateDays = 0;

        if (LocalDate.now()
                .isAfter(issued.getDueDate())) {

            lateDays = ChronoUnit.DAYS.between(
                    issued.getDueDate(),
                    LocalDate.now());
        }

        double fine = lateDays * 100.0;

        issued.setReturnDate(LocalDate.now());
        issued.setFine(fine);
        issued.setRecordStatus("RETURNED");
        issued.setPaidAmount(0.0);
        issued.setBalanceAmount(fine);

        issued.setFineStatus(
                fine > 0 ? "PENDING" : "NO_FINE");

        copy.setStatus("AVAILABLE");
        book.setAvailableCopies(
                book.getAvailableCopies() + 1);

        issuedBookRepository.save(issued);
        bookCopyRepository.save(copy);
        bookRepository.save(book);

        result.put("issueId", issued.getRecordId());
        result.put("copyCode", copy.getCopyCode());
        result.put("bookTitle", book.getBookName());
        result.put("issuedTo", issued.getStudent().getHallTicket()); // adjust if needed
        result.put("issuedDate", issued.getIssueDate());
        result.put("dueDate", issued.getDueDate());
        result.put("returnDate", issued.getReturnDate());
        result.put("fine", fine);
        result.put("balanceAmount", issued.getBalanceAmount());
        result.put("fineStatus", issued.getFineStatus());
        result.put("status", "RETURNED");


        return result;
    }

    @Transactional
    public Map<String, Object>
    payFine(Long issueId, double amount) {

        if (amount <= 0)
            throw new RuntimeException("Invalid amount");

        IssuedBook issued =
                issuedBookRepository.findById(issueId)
                        .orElseThrow(() ->
                                new RuntimeException("Invalid issue"));

        double balance = issued.getBalanceAmount();

        if (amount > balance)
            throw new RuntimeException("Exceeds balance");

        double newPaid =
                issued.getPaidAmount() + amount;
        double newBalance =
                balance - amount;

        issued.setPaidAmount(newPaid);
        issued.setBalanceAmount(newBalance);

        issued.setFineStatus(
                newBalance == 0 ? "PAID" : "PARTIAL");

        issuedBookRepository.save(issued);

        Map<String, Object> result =
                new HashMap<>();

        result.put("paidAmount", newPaid);
        result.put("balanceAmount", newBalance);
        result.put("fineStatus",
                issued.getFineStatus());

        return result;
    }

    public List<IssuedBook> getAllIssuedBooks() {
        return issuedBookRepository.findAll();
    }

    public List<String> searchCopyCodes(String key) {

        if (key == null || key.trim().isEmpty())
            return new ArrayList<>();

        return issuedBookRepository
                .searchIssuedCopyCodes(key);
    }


    @Transactional
	public String reserveBook(
	        Long bookId,
	        String hallTicket) {
	
	    Book book =
	            bookRepository.findById(bookId)
	                    .orElseThrow(() ->
	                            new RuntimeException("Invalid book"));
	
	    Student student =
	            studentRepository.findByHallTicket(hallTicket)
	                    .orElseThrow(() ->
	                            new RuntimeException("Invalid student"));
	
	    if (book.getAvailableCopies() > 0)
	        return "Copies available. No need to reserve.";
	
	    BookReservation reservation = new BookReservation();
	
	    reservation.setBook(book);
	    reservation.setStudent(student);
	    reservation.setReservationDate(LocalDate.now());
	    reservation.setStatus("ACTIVE");
	
	    bookReservationRepository.save(reservation);
	
	    return "Book reserved successfully";
	}


    public List<BookReservation>
    getAllReservations() {
        return bookReservationRepository.findAll();
    }
    @Transactional
    public Map<String, Object>
    markCopyStatus(Long copyId, String status) {

        status = status.toUpperCase();

        BookCopy copy =
                bookCopyRepository.findById(copyId)
                        .orElseThrow(() ->
                                new RuntimeException("Invalid copy"));

        Book book = copy.getBook();

        String oldStatus = copy.getStatus();

        if ("ISSUED".equals(oldStatus))
            throw new RuntimeException(
                    "Cannot change ISSUED copy");

        copy.setStatus(status);

        bookCopyRepository.save(copy);
        bookRepository.save(book);

        Map<String, Object> result =
                new HashMap<>();

        result.put("copyId", copy.getCopyId());
        result.put("newStatus", status);

        return result;
    }

    public List<Map<String, Object>> filterLostAndDamagedByBookName(String bookName) {

    List<BookCopy> copies;

    if (bookName == null || bookName.trim().isEmpty()) {

        // ✅ When no search → return ALL lost & damaged
        copies = bookCopyRepository
                .findByStatusIn(List.of("LOST", "DAMAGED"));

    } else {

        // ✅ When search → filter by book name
        copies = bookCopyRepository
                .findLostAndDamagedByBookName(bookName);
    }

    List<Map<String, Object>> result = new ArrayList<>();

    for (BookCopy copy : copies) {

        Map<String, Object> map = new HashMap<>();

        map.put("bookName", copy.getBook().getBookName());
        map.put("copyCode", copy.getCopyCode());
        map.put("status", copy.getStatus());

        result.add(map);
    }

    return result;
}


public Map<String, Object> getDashboardStats(LocalDate from, LocalDate to) {

    Map<String, Object> result = new HashMap<>();

    try {

        System.out.println("Dashboard API called...");
        System.out.println("From = " + from + " , To = " + to);

        Map<String, Long> stats = new HashMap<>();

        stats.put("totalBooks", bookRepository.count());
        stats.put("totalCopies", bookCopyRepository.count());
        stats.put("availableCopies", bookCopyRepository.countAvailableCopies());
        stats.put("issuedCount", issuedBookRepository.count());
        stats.put("totalStudents", studentRepository.count());
        stats.put("overdueCount", issuedBookRepository.countOverdueRaw());
        stats.put("todayIssued", issuedBookRepository.countTodayIssuedRaw());
        stats.put("lostCopies", bookCopyRepository.countLostCopies());
        stats.put("damagedCopies", bookCopyRepository.countDamagedCopies());

        result.put("stats", stats);

        boolean useFilter = (from != null && to != null);

        List<Object[]> recentRaw;
        List<Object[]> issuedGraphRaw;
        List<Object[]> overdueGraphRaw;

        if (useFilter) {

            System.out.println("Using BETWEEN filter");

            recentRaw = issuedBookRepository.findRecentIssuedBetween(from, to);
            issuedGraphRaw = issuedBookRepository.findIssuedGraphBetween(from, to);
            overdueGraphRaw = issuedBookRepository.findOverdueGraphBetween(from, to);

        } else {

            System.out.println("Using TODAY data only");

            recentRaw = issuedBookRepository.findRecentIssuedToday();
            issuedGraphRaw = issuedBookRepository.findIssuedGraphToday();
            overdueGraphRaw = issuedBookRepository.findOverdueGraphToday();
        }

        result.put("recentIssued", mapRecentIssued(recentRaw));
        result.put("issuedGraph", mapGraph(issuedGraphRaw));
        result.put("overdueGraph", mapGraph(overdueGraphRaw));
        result.put("topBooks", mapTopBooks());

        System.out.println("Dashboard response prepared successfully");

    } catch (Exception e) {

        System.out.println("Error while loading dashboard data");
        e.printStackTrace();

        result.put("stats", new HashMap<>());
        result.put("recentIssued", new ArrayList<>());
        result.put("issuedGraph", new ArrayList<>());
        result.put("overdueGraph", new ArrayList<>());
        result.put("topBooks", new ArrayList<>());
    }

    return result;
}
private List<Map<String, Object>> mapRecentIssued(List<Object[]> raw) {

    List<Map<String, Object>> list = new ArrayList<>();

    for (Object[] r : raw) {
        Map<String, Object> m = new HashMap<>();
        m.put("studentName", r[0]);
        m.put("bookName", r[1]);
        m.put("copyCode", r[2]);
        m.put("issuedDate", r[3]);
        list.add(m);
    }
    return list;
}

private List<Map<String, Object>> mapGraph(List<Object[]> raw) {

    List<Map<String, Object>> list = new ArrayList<>();

    for (Object[] r : raw) {
        Map<String, Object> m = new HashMap<>();
        m.put("date", String.valueOf(r[0]));
        m.put("count", ((Number) r[1]).longValue());
        list.add(m);
    }
    return list;
}

private List<Map<String, Object>> mapTopBooks() {

    List<Map<String, Object>> list = new ArrayList<>();

    for (Object[] r : issuedBookRepository.findTopBooksRaw()) {
        Map<String, Object> m = new HashMap<>();
        m.put("bookName", r[0]);
        m.put("issueCount", ((Number) r[1]).longValue());
        list.add(m);
    }
    return list;
}



    public List<Map<String, Object>>
    getRecentIssued() {

        List<Object[]> rows =
                issuedBookRepository
                        .findRecentIssuedRaw();

        List<Map<String, Object>> result =
                new ArrayList<>();

        for (Object[] row : rows) {

            Map<String, Object> map =
                    new HashMap<>();

            map.put("studentName", row[0]);
            map.put("bookName", row[1]);
            map.put("copyCode", row[2]);

            result.add(map);
        }

        return result;
    }
    public List<Map<String, Object>> getReturnHistoryByHallTicket(String hallTicket) {

        List<IssuedBook> records =
                issuedBookRepository.findReturnedBooksByHallTicket(hallTicket);

        return records.stream().map(record -> {

            Map<String, Object> map = new HashMap<>();

            map.put("id", record.getRecordId());
            map.put("title", record.getBookCopyId()
                                   .getBook()
                                   .getBookName());
            map.put("issueDate", record.getIssueDate());
            map.put("returnDate", record.getReturnDate());
            map.put("fine", record.getFine() != null ? record.getFine() : 0);
            map.put("paidAmount", record.getPaidAmount());
            map.put("status", record.getRecordStatus());

            return map;

        }).toList();
    }
    public List<BookReservation>
    getReservationsByHallTicket(String hallTicket) {

        Student student =
                studentRepository.findByHallTicket(hallTicket)
                        .orElseThrow(() ->
                                new RuntimeException("Student not found"));

        return bookReservationRepository
                .findByStudent_StudentIdOrderByReservationDateDesc(
                        student.getStudentId()
                );
    }
    @Transactional
    public String cancelReservation(
            Long reservationId,
            String hallTicket) {

        BookReservation reservation =
                bookReservationRepository.findById(reservationId)
                        .orElseThrow(() ->
                                new RuntimeException("Invalid reservation"));

        // 🔒 Ownership check
        if (!reservation.getStudent()
                .getHallTicket().equals(hallTicket)) {

            throw new RuntimeException("Unauthorized action");
        }

        if (!"ACTIVE".equals(reservation.getStatus())) {
            return "Reservation already cancelled";
        }

        reservation.setStatus("CANCELLED");

        bookReservationRepository.save(reservation);

        return "Reservation cancelled successfully";
    }
    @Transactional
    public String reserveBookByCopyCode(
            String copyCode,
            String hallTicket) {

        BookCopy copy =
                bookCopyRepository.findByCopyCode(copyCode)
                        .orElseThrow(() ->
                                new RuntimeException("Invalid copy code"));

        Book book = copy.getBook();

        Student student =
                studentRepository.findByHallTicket(hallTicket)
                        .orElseThrow(() ->
                                new RuntimeException("Student not found"));

        if (book.getAvailableCopies() > 0) {
            return "Copies available. No need to reserve.";
        }

        // Prevent duplicate active reservation
        boolean alreadyReserved =
                bookReservationRepository
                        .existsByBookAndStudentAndStatus(
                                book, student, "ACTIVE");

        if (alreadyReserved) {
            return "You already reserved this book";
        }

        BookReservation reservation = new BookReservation();
        reservation.setBook(book);
        reservation.setStudent(student);
        reservation.setReservationDate(LocalDate.now());
        reservation.setStatus("ACTIVE");

        bookReservationRepository.save(reservation);

        return "Book reserved successfully";
    }
    @Transactional
    public String reserveFlexible(
            Long bookId,
            String bookCode,
            String copyCode,
            String hallTicket) {

        Book book = null;

        // 🔹 Priority 1: copyCode
        if (copyCode != null && !copyCode.isBlank()) {

            BookCopy copy =
                    bookCopyRepository.findByCopyCode(copyCode)
                            .orElseThrow(() ->
                                    new RuntimeException("Invalid copy code"));

            book = copy.getBook();
        }

        // 🔹 Priority 2: bookCode
        else if (bookCode != null && !bookCode.isBlank()) {

            book = bookRepository.findByBookCode(bookCode.trim())
                    .orElseThrow(() ->
                            new RuntimeException("Invalid book code"));
        }

        // 🔹 Priority 3: bookId
        else if (bookId != null) {

            book = bookRepository.findById(bookId)
                    .orElseThrow(() ->
                            new RuntimeException("Invalid book ID"));
        }

        else {
            throw new RuntimeException("Provide bookId or bookCode or copyCode");
        }

        Student student =
                studentRepository.findByHallTicket(hallTicket)
                        .orElseThrow(() ->
                                new RuntimeException("Student not found"));

        if (book.getAvailableCopies() > 0) {
            return "Copies available. No need to reserve.";
        }

        boolean alreadyReserved =
                bookReservationRepository
                        .existsByBookAndStudentAndStatus(
                                book, student, "ACTIVE");

        if (alreadyReserved) {
            return "You already reserved this book";
        }

        BookReservation reservation = new BookReservation();
        reservation.setBook(book);
        reservation.setStudent(student);
        reservation.setReservationDate(LocalDate.now());
        reservation.setStatus("ACTIVE");

        bookReservationRepository.save(reservation);

        return "Book reserved successfully";
    }
    public List<Map<String, Object>> getFinesByHallTicket(String hallTicket) {

        Student student =
                studentRepository.findByHallTicket(hallTicket)
                        .orElseThrow(() ->
                                new RuntimeException("Student not found"));

        List<IssuedBook> records =
                issuedBookRepository
                        .findByStudentAndFineGreaterThan(student, 0.0);

        List<Map<String, Object>> result = new ArrayList<>();

        for (IssuedBook r : records) {

            Map<String, Object> map = new HashMap<>();

            map.put("id", r.getRecordId());
            map.put("book", r.getBookCopyId()
                             .getBook()
                             .getBookName());
            map.put("amount", r.getBalanceAmount());
            map.put("date",
                    r.getReturnDate() != null
                            ? r.getReturnDate()
                            : r.getIssueDate());

            map.put("status",
                    "PAID".equals(r.getFineStatus())
                            ? "Paid"
                            : "Pending");

            result.add(map);
        }

        return result;
    }
    public Map<String, Object> getStudentDashboard(String hallTicket) {

        Student student = studentRepository
                .findByHallTicket(hallTicket)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Map<String, Object> result = new HashMap<>();

        // Issued books
        List<IssuedBook> issued =
                issuedBookRepository
                        .findByStudentAndRecordStatus(student, "ISSUED");

        long issuedCount = issued.size();

        // Due soon (next 2 days)
        long dueSoon = issued.stream()
                .filter(i -> i.getDueDate() != null &&
                        !i.getDueDate().isBefore(LocalDate.now()) &&
                        i.getDueDate().isBefore(LocalDate.now().plusDays(3)))
                .count();

        // Overdue
        long overdue = issued.stream()
                .filter(i -> i.getDueDate() != null &&
                        i.getDueDate().isBefore(LocalDate.now()))
                .count();

        // Pending fine
        double pendingFine =
                issuedBookRepository
                        .sumPendingFineByStudent(student);

        // Reservations
        long reservations =
                bookReservationRepository
                        .countByStudentAndStatus(student, "ACTIVE");

        // Recent issued (last 3)
        List<Map<String, Object>> recentIssued =
                issued.stream()
                        .sorted(Comparator.comparing(
                                IssuedBook::getIssueDate).reversed())
                        .limit(3)
                        .map(i -> {
                            Map<String, Object> m = new HashMap<>();
                            m.put("bookName",
                                    i.getBookCopyId()
                                            .getBook()
                                            .getBookName());
                            m.put("issueDate", i.getIssueDate());
                            m.put("dueDate", i.getDueDate());

                            String status =
                                    i.getDueDate().isBefore(LocalDate.now())
                                            ? "Overdue"
                                            : "Active";

                            m.put("status", status);
                            return m;
                        })
                        .toList();

        result.put("issuedCount", issuedCount);
        result.put("dueSoon", dueSoon);
        result.put("pendingFine", pendingFine);
        result.put("reservations", reservations);
        result.put("overdue", overdue);
        result.put("recentIssued", recentIssued);

        return result;
    }
    public List<BookCopy> getCopiesByBookId(Long bookId) {

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() ->
                        new RuntimeException("Invalid book"));

        return bookCopyRepository.findByBook(book);
    }
   @Transactional
	public String requestCopy(
	        Long bookId,
	        String copyCode,
	        int days,
	        String hallTicket) {
	
	    if (days <= 0 || days > 30) {
	        return "Invalid issue days (1–30 allowed)";
	    }
	
	    Student student =
	            studentRepository.findByHallTicket(hallTicket)
	                    .orElseThrow(() ->
	                            new RuntimeException("Student not found"));
	
	    long activeIssuedCount =
	            issuedBookRepository.countByStudentAndRecordStatus(
	                    student, "ISSUED");
	
	    if (activeIssuedCount >= 3) {
	        return "Maximum 3 books already issued";
	    }
	
	    BookCopy copy =
	            bookCopyRepository.findByCopyCode(copyCode)
	                    .orElseThrow(() ->
	                            new RuntimeException("Invalid copy"));
	
	    if (!"AVAILABLE".equals(copy.getStatus())) {
	        return "Copy not available";
	    }
	
	    boolean alreadyRequested =
	            bookRequestRepository
	                    .existsByCopyCodeAndHallTicketAndStatus(
	                            copyCode, hallTicket, "PENDING");
	
	    if (alreadyRequested) {
	        return "You already requested this copy";
	    }
	
	    BookRequest req = new BookRequest();
	    req.setBookId(bookId);
	    req.setCopyCode(copyCode);
	    req.setHallTicket(hallTicket);
	    req.setDays(days);                // ✅ STORE DAYS
	    req.setRequestType("ISSUE");
	    req.setStatus("PENDING");
	    req.setRequestTime(LocalDateTime.now());
	
	    bookRequestRepository.save(req);
	
	    return "Request sent to admin for " + days + " days";
	}
    public List<Map<String, Object>> getAdminNotifications() {

        List<BookRequest> requests =
                bookRequestRepository.findByStatus("PENDING");

        List<Map<String, Object>> result = new ArrayList<>();

        for (BookRequest r : requests) {

            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("bookId", r.getBookId());
            map.put("copyCode", r.getCopyCode());
            map.put("hallTicket", r.getHallTicket());
            map.put("time", r.getRequestTime());

            result.add(map);
        }

        return result;
    }
   @Transactional
	public String approveBookRequest(Long requestId, int ignored) {
	
	    BookRequest request =
	            bookRequestRepository.findById(requestId)
	                    .orElseThrow(() ->
	                            new RuntimeException("Invalid request"));
	
	    if (!"PENDING".equals(request.getStatus())) {
	        return "Request already processed";
	    }
	
	    // 🔁 RETURN FLOW
	    if ("RETURN".equals(request.getRequestType())) {
	
	        returnBookByCopyCode(request.getCopyCode());
	
	        request.setStatus("APPROVED");
	        bookRequestRepository.save(request);
	
	        return "Book returned successfully";
	    }
	
	    // 🔁 ISSUE FLOW
	    if ("ISSUE".equals(request.getRequestType())) {
	
	        BookCopy copy =
	                bookCopyRepository.findByCopyCode(request.getCopyCode())
	                        .orElseThrow(() ->
	                                new RuntimeException("Copy not found"));
	
	        if (!"AVAILABLE".equals(copy.getStatus())) {
	            return "Copy not available";
	        }
	
	        Student student =
	                studentRepository.findByHallTicket(request.getHallTicket())
	                        .orElseThrow(() ->
	                                new RuntimeException("Student not found"));
	
	        int days = request.getDays(); // ✅ FROM REQUEST
	
	        IssuedBook issued = new IssuedBook();
	        issued.setBookCopyId(copy);
	        issued.setStudent(student);
	        issued.setIssueDate(LocalDate.now());
	        issued.setDueDate(LocalDate.now().plusDays(days));
	        issued.setRecordStatus("ISSUED");
	        issued.setFine(0.0);
	        issued.setFineStatus("NO_FINE");
	
	        copy.setStatus("ISSUED");
	
	        Book book = copy.getBook();
	        book.setAvailableCopies(book.getAvailableCopies() - 1);
	
	        issuedBookRepository.save(issued);
	        bookCopyRepository.save(copy);
	        bookRepository.save(book);
	
	        request.setStatus("APPROVED");
	        bookRequestRepository.save(request);
	
	        return "Book issued for " + days + " days";
	    }
	
	    return "Invalid request type";
	}
	 @Transactional
    public String rejectBookRequest(Long requestId) {

        BookRequest request =
                bookRequestRepository.findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException("Invalid request"));

        if (!"PENDING".equals(request.getStatus())) {
            return "Request already processed";
        }

        request.setStatus("REJECTED");
        bookRequestRepository.save(request);

        return "Request rejected";
    }
    public List<Map<String, Object>> getStudentNotifications(String hallTicket) {

        List<BookRequest> requests =
                bookRequestRepository
                        .findByHallTicketAndStatusIn(
                                hallTicket,
                                List.of("APPROVED", "REJECTED")
                        );

        List<Map<String, Object>> result = new ArrayList<>();

        for (BookRequest r : requests) {

            Map<String, Object> map = new HashMap<>();

            map.put("id", r.getId());
            map.put("copyCode", r.getCopyCode());
            map.put("status", r.getStatus());
            map.put("viewed", r.isViewed());

            String message =
                    "APPROVED".equals(r.getStatus())
                            ? "Your request for copy "
                                + r.getCopyCode()
                                + " has been approved"
                            : "Your request for copy "
                                + r.getCopyCode()
                                + " was rejected";

            map.put("message", message);

            result.add(map);
        }

        return result;
    }
    @Transactional
    public void markNotificationRead(Long id, String hallTicket) {

        BookRequest request =
                bookRequestRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException("Invalid request"));

        if (!request.getHallTicket().equals(hallTicket)) {
            throw new RuntimeException("Unauthorized");
        }

        request.setViewed(true);

        // 🔥 IMPORTANT FIX
        bookRequestRepository.saveAndFlush(request);
    }
    @Transactional
    public String requestReturn(
            Long recordId,
            String copyCode,
            String hallTicket) {

        IssuedBook issued =
                issuedBookRepository.findById(recordId)
                        .orElseThrow(() ->
                                new RuntimeException("Invalid issue record"));

        if (!issued.getStudent().getHallTicket().equals(hallTicket)) {
            return "Unauthorized request";
        }

        if (!"ISSUED".equals(issued.getRecordStatus())) {
            return "Book already returned";
        }

        // Prevent duplicate return request
        boolean alreadyRequested =
                bookRequestRepository
                        .existsByCopyCodeAndHallTicketAndStatus(
                                copyCode, hallTicket, "PENDING");

        if (alreadyRequested) {
            return "Return request already sent";
        }

        BookRequest req = new BookRequest();
        req.setBookId(issued.getBookCopyId().getBook().getBookId());
        req.setCopyCode(copyCode);
        req.setHallTicket(hallTicket);
        req.setStatus("PENDING");
        req.setRequestType("RETURN");
        req.setRequestTime(LocalDateTime.now());

        bookRequestRepository.save(req);

        return "Return request sent to admin";
    }

}
