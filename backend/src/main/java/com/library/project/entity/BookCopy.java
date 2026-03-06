package com.library.project.entity;


import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;

@Entity
@Table(name = "book_copy")
public class BookCopy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long copyId;

    @ManyToOne
    @JoinColumn(name = "book_id")
    @JsonIgnoreProperties("copies")
    private Book book;

    private String copyCode;

    private String status;
    @OneToMany(mappedBy = "bookCopyId")
    @JsonIgnore
    private List<IssuedBook> issuedBooks;

    public List<IssuedBook> getIssuedBooks() {
		return issuedBooks;
	}

	public void setIssuedBooks(List<IssuedBook> issuedBooks) {
		this.issuedBooks = issuedBooks;
	}

	public Long getCopyId() {
        return copyId;
    }

    public void setCopyId(Long copyId) {
        this.copyId = copyId;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }

    public String getCopyCode() {
        return copyCode;
    }

    public void setCopyCode(String copyCode) {
        this.copyCode = copyCode;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
