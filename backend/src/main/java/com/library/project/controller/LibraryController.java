package com.library.project.controller;

import java.time.LocalDate;
import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.library.project.entity.*;
import com.library.project.service.LibraryService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/library")
public class LibraryController {

    @Autowired
    private LibraryService libraryService;
    // Add book with copies
    @PostMapping("/book/with-copies")
    public String addBookWithCopies(@RequestBody Book book) {
        try {
            return libraryService.addBookWithCopies(book);
        } catch (Exception e) {
            e.printStackTrace();
            return "Error while adding book";
        }
    }

    // Get all books
    @GetMapping("/books")
    public List<Book> getAllBooks() {
        return libraryService.getAllBooks();
    }

    // Book history
    @GetMapping("/books/{bookId}/history")
    public List<IssuedBook> getBookHistory(
            @PathVariable Long bookId) {
        try {
            return libraryService.getBookHistory(bookId);
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    // Add student
    @PostMapping("/student")
    public String addStudent(@RequestBody Student student) {
        try {
            return libraryService.addStudent(student);
        } catch (Exception e) {
            e.printStackTrace();
            return "Error while adding student";
        }
    }

    // Get all students
    @GetMapping("/students")
    public List<Student> getAllStudents() {
        try {
            return libraryService.getAllStudents();
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    // Student history
    @GetMapping("/students/{hallTicket}/history")
    public ResponseEntity<?> getStudentHistory(@PathVariable String hallTicket) {
        try {
            return ResponseEntity.ok(
                    libraryService.getStudentHistory(hallTicket)
            );
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }


    // Active issues of student
    @GetMapping("/students/{hallTicket}/active-issues")
    public List<IssuedBook> getActiveIssuesOfStudent(
            @PathVariable String hallTicket) {
        try {
            return libraryService
                    .getActiveIssuedBooksOfStudent(hallTicket);
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }
    // Issue book
    @PostMapping("/issue")
    public String issueBook(
            @RequestBody Map<String, Object> body) {

        try {
            Long copyId =
                    Long.parseLong(body.get("copyId").toString());

            String hallTicket =
                    body.get("hallTicket").toString();

            int days =
                    Integer.parseInt(body.get("days").toString());

            return libraryService
                    .issueBook(copyId, hallTicket, days);

        } catch (Exception e) {
            e.printStackTrace();
            return "Error while issuing book";
        }
    }


    // Return book
    @PostMapping("/return-by-copy")
    public ResponseEntity<?> returnBook(
            @RequestParam String copyCode) {
        try {
            return ResponseEntity.ok(
                    libraryService
                            .returnBookByCopyCode(copyCode));
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // Pay fine
    @PostMapping("/pay-fine")
    public ResponseEntity<?> payFine(
            @RequestParam Long issueId,
            @RequestParam double amount) {
        try {
            return ResponseEntity.ok(
                    libraryService
                            .payFine(issueId, amount));
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // All issued books
    @GetMapping("/issued")
    public List<IssuedBook> getAllIssuedBooks() {
        try {
            return libraryService.getAllIssuedBooks();
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    // Search copy codes (autocomplete)
    @GetMapping("/copies/search")
    public List<String> searchCopyCodes(
            @RequestParam String key) {
        try {
            return libraryService.searchCopyCodes(key);
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    // Reserve book
    @PostMapping("/reserve")
    public ResponseEntity<?> reserveBook(
            @RequestParam Long bookId,
            @RequestParam String hallTicket) {
        try {
            return ResponseEntity.ok(
                    libraryService
                            .reserveBook(bookId, hallTicket));
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // All reservations
    @GetMapping("/reservations")
    public List<BookReservation> getAllReservations() {
        return libraryService.getAllReservations();
    }
    // Mark copy status
    @PostMapping("/copy/mark-status")
    public ResponseEntity<?> markCopyStatus(
            @RequestParam String copyCode,
            @RequestParam String status,
            @RequestParam double fine) {
        try {
            return ResponseEntity.ok(
                    libraryService
                            .markCopyStatus(copyCode, status, fine));
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // Filter lost & damaged
    @GetMapping("/copies/lost-damaged")
    public ResponseEntity<?> filterLostAndDamaged(
    		@RequestParam(required = false) String bookName) {
        try {
            return ResponseEntity.ok(
                    libraryService
                            .filterLostAndDamagedByBookName(bookName));
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
    // Dashboard stats
    @GetMapping("/dashboard")
    public Map<String, Object> getDashboardStats(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {
        return libraryService.getDashboardStats(from, to);
    }


    // Recent issued
    @GetMapping("/issued/recent")
    public List<Map<String, Object>> getRecentIssued() {
        return libraryService.getRecentIssued();
    }
    @GetMapping("/student/return-history")
    public ResponseEntity<?> getReturnHistory(HttpSession session) {

        String role = (String) session.getAttribute("ROLE");
        String hallTicket = (String) session.getAttribute("HALL_TICKET");

        if (role == null || !"STUDENT".equals(role) || hallTicket == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Unauthorized"));
        }

        return ResponseEntity.ok(
        		libraryService.getReturnHistoryByHallTicket(hallTicket)
        );
    }
    @PostMapping("/student/reserve")
    public ResponseEntity<?> reserveBookForStudent(
            @RequestParam Long bookId,
            HttpSession session) {

        String role = (String) session.getAttribute("ROLE");
        String hallTicket = (String) session.getAttribute("HALL_TICKET");

        if (role == null || !"STUDENT".equals(role) || hallTicket == null) {
            return ResponseEntity.status(401)
                    .body("Unauthorized");
        }

        try {
            return ResponseEntity.ok(
                    libraryService.reserveBook(bookId, hallTicket)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }
    @GetMapping("/student/reservations")
    public ResponseEntity<?> getStudentReservations(HttpSession session) {

        String role = (String) session.getAttribute("ROLE");
        String hallTicket = (String) session.getAttribute("HALL_TICKET");

        if (role == null || !"STUDENT".equals(role) || hallTicket == null) {
            return ResponseEntity.status(401)
                    .body("Unauthorized");
        }

        return ResponseEntity.ok(
                libraryService.getReservationsByHallTicket(hallTicket)
        );
    }
    @PostMapping("/student/reservations/{id}/cancel")
    public ResponseEntity<?> cancelReservation(
            @PathVariable Long id,
            HttpSession session) {

        String role = (String) session.getAttribute("ROLE");
        String hallTicket = (String) session.getAttribute("HALL_TICKET");

        if (role == null || !"STUDENT".equals(role) || hallTicket == null) {
            return ResponseEntity.status(401)
                    .body("Unauthorized");
        }

        try {
            return ResponseEntity.ok(
                    libraryService.cancelReservation(id, hallTicket)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }
    @PostMapping("/student/reserve-by-copy")
    public ResponseEntity<?> reserveByCopyCode(
            @RequestParam String copyCode,
            HttpSession session) {

        String role = (String) session.getAttribute("ROLE");
        String hallTicket = (String) session.getAttribute("HALL_TICKET");

        if (role == null || !"STUDENT".equals(role) || hallTicket == null) {
            return ResponseEntity.status(401)
                    .body("Unauthorized");
        }

        try {
            return ResponseEntity.ok(
                    libraryService.reserveBookByCopyCode(copyCode, hallTicket)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }
    @PostMapping("/student/reserved")
    public ResponseEntity<?> reserveBookFlexible(
            @RequestParam(required = false) Long bookId,
            @RequestParam(required = false) String bookCode,
            @RequestParam(required = false) String copyCode,
            HttpSession session) {

        String role = (String) session.getAttribute("ROLE");
        String hallTicket = (String) session.getAttribute("HALL_TICKET");

        if (role == null || !"STUDENT".equals(role) || hallTicket == null) {
            return ResponseEntity.status(401)
                    .body("Unauthorized");
        }

        try {
            return ResponseEntity.ok(
                    libraryService.reserveFlexible(
                            bookId, bookCode, copyCode, hallTicket));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }
    @GetMapping("/student/fines")
    public ResponseEntity<?> getStudentFines(HttpSession session) {

        String role = (String) session.getAttribute("ROLE");
        String hallTicket = (String) session.getAttribute("HALL_TICKET");

        if (role == null || !"STUDENT".equals(role) || hallTicket == null) {
            return ResponseEntity.status(401)
                    .body("Unauthorized");
        }

        return ResponseEntity.ok(
                libraryService.getFinesByHallTicket(hallTicket)
        );
    }
    @GetMapping("/student/dashboard")
    public ResponseEntity<?> getStudentDashboard(HttpSession session) {

        String role = (String) session.getAttribute("ROLE");
        String hallTicket = (String) session.getAttribute("HALL_TICKET");

        if (role == null || !"STUDENT".equals(role) || hallTicket == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        return ResponseEntity.ok(
                libraryService.getStudentDashboard(hallTicket)
        );
    }
    @GetMapping("/copies/by-book")
    public ResponseEntity<?> getCopiesByBook(@RequestParam Long bookId) {

        try {
            List<BookCopy> copies =
                    libraryService.getCopiesByBookId(bookId);

            return ResponseEntity.ok(copies);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }
    @PostMapping("/student/request-copy")
	public ResponseEntity<?> requestCopy(
	        @RequestParam Long bookId,
	        @RequestParam String copyCode,
	        @RequestParam int days,
	        HttpSession session) {
	
	    String role = (String) session.getAttribute("ROLE");
	    String hallTicket = (String) session.getAttribute("HALL_TICKET");
	
	    if (!"STUDENT".equals(role) || hallTicket == null) {
	        return ResponseEntity.status(401).body("Unauthorized");
	    }
	
	    return ResponseEntity.ok(
	            libraryService.requestCopy(
	                    bookId, copyCode, days, hallTicket));
	}
    @GetMapping("/admin/notifications")
    public ResponseEntity<?> getAdminNotifications() {

        try {
            return ResponseEntity.ok(
                    libraryService.getAdminNotifications()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }
    @PostMapping("/admin/requests/{id}/approve")
    public ResponseEntity<?> approveRequest(
            @PathVariable Long id,
            @RequestParam(defaultValue = "14") int days) {

        try {
            return ResponseEntity.ok(
                    libraryService.approveBookRequest(id, days)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }
    @PostMapping("/admin/requests/{id}/reject")
    public ResponseEntity<?> rejectRequest(
            @PathVariable Long id) {

        try {
            return ResponseEntity.ok(
                    libraryService.rejectBookRequest(id)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }
    @GetMapping("/student/notifications")
    public ResponseEntity<?> getStudentNotifications(HttpSession session) {

        String role = (String) session.getAttribute("ROLE");
        String hallTicket = (String) session.getAttribute("HALL_TICKET");

        if (!"STUDENT".equals(role) || hallTicket == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        return ResponseEntity.ok(
                libraryService.getStudentNotifications(hallTicket)
        );
    }
    @PostMapping("/student/notifications/{id}/read")
    public ResponseEntity<?> markNotificationRead(
            @PathVariable Long id,
            HttpSession session) {

        String role = (String) session.getAttribute("ROLE");
        String hallTicket = (String) session.getAttribute("HALL_TICKET");

        if (!"STUDENT".equals(role) || hallTicket == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        libraryService.markNotificationRead(id, hallTicket);

        return ResponseEntity.ok().build();
    }
    @PostMapping("/student/request-return")
    public ResponseEntity<?> requestReturn(
            @RequestParam Long recordId,
            @RequestParam String copyCode,
            HttpSession session) {

        String role = (String) session.getAttribute("ROLE");
        String hallTicket = (String) session.getAttribute("HALL_TICKET");

        if (!"STUDENT".equals(role) || hallTicket == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        return ResponseEntity.ok(
                libraryService.requestReturn(recordId, copyCode, hallTicket)
        );
    }
	@GetMapping("/students/template")
	public ResponseEntity<byte[]> downloadTemplate() {
	
	    try {
	
	        byte[] file = libraryService.generateStudentTemplate();
	
	        return ResponseEntity.ok()
	                .header("Content-Disposition",
	                        "attachment; filename=students_template.xlsx")
	                .body(file);
	
	    } catch (Exception e) {
	
	        return ResponseEntity.badRequest().build();
	
	    }
	}
	
	
	// Upload students
	@PostMapping("/students/upload")
	public ResponseEntity<?> uploadStudents(
	        @RequestParam("file") MultipartFile file) {
	
	    try {
	
	        return ResponseEntity.ok(
	                libraryService.uploadStudentsFromExcel(file)
	        );
	
	    } catch (Exception e) {
	
	        return ResponseEntity.badRequest()
	                .body(e.getMessage());
	
	    }
	}
}
