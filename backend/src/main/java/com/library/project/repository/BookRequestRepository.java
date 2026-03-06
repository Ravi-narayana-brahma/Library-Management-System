package com.library.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.library.project.entity.BookRequest;

public interface BookRequestRepository
extends JpaRepository<BookRequest, Long> {

List<BookRequest> findByStatus(String status);
List<BookRequest> findByHallTicketAndStatusIn(
        String hallTicket,
        List<String> statuses
);
boolean existsByCopyCodeAndHallTicketAndStatus(
        String copyCode,
        String hallTicket,
        String status
);
}
