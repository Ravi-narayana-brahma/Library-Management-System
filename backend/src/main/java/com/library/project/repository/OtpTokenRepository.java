package com.library.project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.library.project.entity.OtpToken;

public interface OtpTokenRepository
extends JpaRepository<OtpToken, Long> {
	Optional<OtpToken> findByEmail(String email);
Optional<OtpToken> findByEmailAndOtp(String email, String otp);
void deleteByEmail(String email);

}

