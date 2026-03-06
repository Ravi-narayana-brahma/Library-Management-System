package com.library.project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.library.project.entity.Book;
import com.library.project.entity.BookCopy;

@Repository
public interface BookCopyRepository extends JpaRepository<BookCopy, Long> {
    @Query("select count(bc) from BookCopy bc where bc.status = 'AVAILABLE'")
    Long countAvailableCopies();

    Optional<BookCopy> findByCopyCode(String copyCode);
    int countByBook(Book book);
    @Query("SELECT COUNT(c) FROM BookCopy c WHERE c.status = 'LOST'")
    long countLostCopies();

    @Query("SELECT COUNT(c) FROM BookCopy c WHERE c.status = 'DAMAGED'")
    long countDamagedCopies();

    @Query("""
           SELECT c.status, COUNT(c)
           FROM BookCopy c
           WHERE c.status IN ('LOST','DAMAGED')
           GROUP BY c.status
           """)
    List<Object[]> countLostAndDamagedGrouped();
    @Query("""
    	       SELECT c
    	       FROM BookCopy c
    	       WHERE c.book.bookName LIKE %:bookName%
    	       AND c.status IN ('LOST','DAMAGED')
    	       """)
    	List<BookCopy> findLostAndDamagedByBookName(String bookName);

    List<BookCopy> findByStatusIn(List<String> status);

    List<BookCopy> findByBook(Book book);
}
