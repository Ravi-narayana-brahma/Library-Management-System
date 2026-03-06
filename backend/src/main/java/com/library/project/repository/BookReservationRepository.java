package com.library.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.library.project.entity.Book;
import com.library.project.entity.BookReservation;
import com.library.project.entity.Student;

@Repository
public interface BookReservationRepository
        extends JpaRepository<BookReservation, Long> {

    boolean existsByBookAndStudentAndStatus(
            Book book,
            Student student,
            String status
    );

    List<BookReservation>
    findByBookAndStatusOrderByReservationDateAsc(
            Book book,
            String status
    );
    List<BookReservation>
    findByStudent_StudentIdOrderByReservationDateDesc(Long studentId);
    long countByStudentAndStatus(
            Student student,
            String status
    );

}
