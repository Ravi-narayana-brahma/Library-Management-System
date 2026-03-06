package com.library.project.controller;

import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;

import com.library.project.service.AuthService;

import jakarta.servlet.http.HttpSession;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/student/login")
    public ResponseEntity<?> studentLogin(
            @RequestBody Map<String, String> request,
            HttpSession session) {

        try {
            return ResponseEntity.ok(
                authService.studentLogin(
                    request.get("username"),
                    request.get("password"),
                    session
                )
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        return ResponseEntity.ok(
                authService.logout(session)
        );
    }
    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(
            @RequestBody Map<String, String> request,
            HttpSession session) {

        try {
            return ResponseEntity.ok(
                    authService.adminLogin(
                            request.get("username"),
                            request.get("password"),
                            session
                    )
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }
    @PostMapping("/admin/register")
    public ResponseEntity<?> registerAdmin(
            @RequestBody Map<String, String> request) {

        try {
            return ResponseEntity.ok(
                    authService.registerAdmin(
                            request.get("username"),
                            request.get("email"),
                            request.get("password")
                    )
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @RequestBody Map<String, String> req) {

        try {
            return ResponseEntity.ok(
                    authService.sendOtp(req.get("email"))
            );
        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }


    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @RequestBody Map<String, String> req) {
        return ResponseEntity.ok(
            authService.verifyOtp(
                req.get("email"),
                req.get("otp"))
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody Map<String, String> req) {
        return ResponseEntity.ok(
            authService.resetPassword(
                req.get("email"),
                req.get("password"))
        );
    }
    @GetMapping("/me")
    public ResponseEntity<?> whoAmI(HttpSession session) {

        System.out.println("SESSION ID: " + session.getId());
        System.out.println("ROLE: " + session.getAttribute("ROLE"));

        String role = (String) session.getAttribute("ROLE");

        if (role == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Unauthorized"));
        }

        // ✅ STUDENT
        if ("STUDENT".equals(role)) {
            return ResponseEntity.ok(
                    Map.of(
                            "role", "STUDENT",
                            "studentId", session.getAttribute("STUDENT_ID"),
                            "hallTicket", session.getAttribute("HALL_TICKET"),
                            "name", session.getAttribute("STUDENT_NAME")
                    )
            );
        }

        // ✅ ADMIN
        if ("ADMIN".equals(role)) {
            return ResponseEntity.ok(
                    Map.of(
                            "role", "ADMIN",
                            "adminId", session.getAttribute("ADMIN_ID"),
                            "username", session.getAttribute("ADMIN_USERNAME")
                    )
            );
        }

        return ResponseEntity.status(401)
                .body(Map.of("message", "Unauthorized"));
    }


    @GetMapping("/student/profile")
    public ResponseEntity<?> getStudentProfile(HttpSession session) {

        Object role = session.getAttribute("ROLE");
        Object studentId = session.getAttribute("STUDENT_ID");

        if (role == null || !"STUDENT".equals(role)) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Unauthorized"));
        }

        return ResponseEntity.ok(
                authService.getStudentProfile((Long) studentId)
        );
    }
    @GetMapping("/admin/profile")
    public ResponseEntity<?> getAdminProfile(HttpSession session) {

        String role = (String) session.getAttribute("ROLE");
        String adminEmail = (String) session.getAttribute("EMAIL");

        if (role == null || !"ADMIN".equals(role) || adminEmail == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        return ResponseEntity.ok(
                authService.getAdminProfile(adminEmail)
        );
    }


}
