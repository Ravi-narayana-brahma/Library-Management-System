package com.library.project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.library.project.entity.Book;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
	Optional<Book> findByBookCode(String bookCode);
	@Query("select distinct b from Book b left join fetch b.copies")
    List<Book> findAllWithCopies();
}
