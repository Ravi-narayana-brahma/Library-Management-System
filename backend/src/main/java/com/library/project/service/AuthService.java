package com.library.project.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.library.project.entity.Admin;
import com.library.project.entity.OtpToken;
import com.library.project.entity.Student;
import com.library.project.repository.AdminRepository;
import com.library.project.repository.OtpTokenRepository;
import com.library.project.repository.StudentRepository;

import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;

@Service
public class AuthService {
	@Autowired
	private OtpTokenRepository otpRepository;

	// @Autowired
	// private EmailService emailService;

    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private AdminRepository adminRepository;

    // ✅ Admin Login
   public Map<String, Object> adminLogin(
        String username,
        String password,
        HttpSession session) {

    Admin admin = adminRepository.findByUsername(username)
            .orElseThrow(() ->
                    new RuntimeException("Admin not found"));

    // ✅ Check password
    if (!admin.getPassword().equals(password)) {
        throw new RuntimeException("Invalid credentials");
    }

    // 🔐 NEW: Check if account is verified
    if (!admin.isActive()) {
        throw new RuntimeException(
                "Account not verified. Please verify OTP."
        );
    }

    // ✅ Store session values
    session.setAttribute("ROLE", "ADMIN");
    session.setAttribute("ADMIN_ID", admin.getAdminId());
    session.setAttribute("ADMIN_USERNAME", admin.getUsername());
    session.setAttribute("EMAIL", admin.getEmail());

    return Map.of(
        "success", true,
        "message", "Admin login successful"
	);
}

    public Map<String, Object> studentLogin(
            String username,
            String password,
            HttpSession session) {
    	System.out.println("LOGIN SESSION ID: " + session.getId());
        Optional<Student> optionalStudent =
                studentRepository.findByHallTicket(username);

        if (optionalStudent.isEmpty()) {
            throw new RuntimeException("Student not found");
        }

        Student student = optionalStudent.get();

        // ✅ Password check
        if (!password.equals(student.getHallTicket())) {
            throw new RuntimeException("Invalid credentials");
        }

        // ✅ Store session values (SERVER SIDE)
        session.setAttribute("ROLE", "STUDENT");
        session.setAttribute("STUDENT_ID", student.getStudentId());
        session.setAttribute("HALL_TICKET", student.getHallTicket());
        session.setAttribute("STUDENT_NAME", student.getStudentName());

        return Map.of(
		    "success", true,
		    "message", "Student login successful"
		);
    }
    // ✅ ADMIN REGISTER
  	@Transactional
	public Map<String, Object> registerAdmin(
	        String username,
	        String email,
	        String password) {
	
	    if (adminRepository.findByUsername(username).isPresent())
	        throw new RuntimeException("Username already exists");
	
	    if (adminRepository.findByEmail(email).isPresent())
	        throw new RuntimeException("Email already exists");
	
	    Admin admin = new Admin();
	    admin.setUsername(username);
	    admin.setEmail(email);
	    admin.setPassword(password);
	    admin.setActive(false);
		admin.setEmailVerified(false);
	
	    adminRepository.save(admin);
	
	    // generate OTP
	    Map<String,Object> otpData = sendOtp(email);
	
	    return Map.of(
	            "success", true,
	            "message", "OTP generated successfully",
	            "otp", otpData.get("otp")
	    );
	}
	
	@Transactional
	public Map<String, Object> sendOtp(String email) {
	
	    Admin admin = adminRepository.findByEmail(email)
	            .orElseThrow(() ->
	                    new RuntimeException("Email not registered"));
	
	    otpRepository.deleteByEmail(email);
	
	    String otp = String.valueOf(
	            new Random().nextInt(900000) + 100000
	    );
	
	    OtpToken token = new OtpToken();
	    token.setEmail(email);
	    token.setOtp(otp);
	    token.setExpiryTime(LocalDateTime.now().plusMinutes(1));
	
	    otpRepository.save(token);
	
	    return Map.of(
	            "success", true,
	            "message", "OTP generated successfully",
	            "otp", otp
	    );
	}

    @Transactional
	public Map<String, Object> verifyOtp(String email, String otp) {
	
	    OtpToken token = otpRepository.findByEmail(email)
	            .orElseThrow(() ->
	                    new RuntimeException("OTP not found"));
	
	    if (!token.getOtp().equals(otp))
	        throw new RuntimeException("Invalid OTP");
	
	    if (token.getExpiryTime().isBefore(LocalDateTime.now()))
	        throw new RuntimeException("OTP expired");
	
	    // ✅ Activate admin
	    Admin admin = adminRepository.findByEmail(email)
	            .orElseThrow(() ->
	                    new RuntimeException("Admin not found"));
	
	    admin.setActive(true);
	    adminRepository.save(admin);
	
	    otpRepository.deleteByEmail(email);
	
	    return Map.of(
		        "success", true,
		        "message", "Account verified successfully"
		);
	}

    public Map<String, Object> resetPassword(
            String email,
            String newPassword) {

        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Admin not found"));

        admin.setPassword(newPassword);
        adminRepository.save(admin);

        otpRepository.deleteByEmail(email);

       return Map.of(
		        "success", true,
		        "message", "Password reset successfully"
		);
    }

    // ✅ Logout
    public Map<String, Object> logout(HttpSession session) {
        session.invalidate();
        return Map.of("message", "Logged out successfully");
    }
    public Map<String, Object> getStudentProfile(Long studentId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        return Map.of(
                "name", student.getStudentName(),
                "rollNo", student.getHallTicket(),
                "email", student.getEmail(),
                "department", student.getBranch(),
                "year", student.getYear()
        );
    }
    public Map<String, Object> getAdminProfile(String email) {

        Admin admin = adminRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        Map<String, Object> map = new HashMap<>();
        map.put("username", admin.getUsername());
        map.put("email", admin.getEmail());
        map.put("verified", admin.isEmailVerified());

        return map;
    }


}
