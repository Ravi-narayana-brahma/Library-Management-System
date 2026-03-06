package com.library.project.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.LocalDate;

import jakarta.persistence.*;
@Entity
@Table(name="issued_books")
public class IssuedBook {
	
	@Id
	@GeneratedValue(strategy= GenerationType.IDENTITY)
	private Long recordId;
	
	@ManyToOne
    @JoinColumn(name = "student_id")
	private Student student;
	
	@ManyToOne
	@JoinColumn(name = "copy_id")
	private BookCopy bookCopyId;
	
	private LocalDate issueDate;
	private LocalDate dueDate;
	private Double fine;
	private Double paidAmount;
	private Double balanceAmount;
	private String fineStatus;
	public Student getStudent() {
		return student;
	}
	public void setStudent(Student student) {
		this.student = student;
	}
	private String recordStatus;
	private LocalDate returnDate;
	public Long getRecordId() {
		return recordId;
	}
	public void setRecordId(Long recordId) {
		this.recordId = recordId;
	}
	public BookCopy getBookCopyId() {
		return bookCopyId;
	}
	public void setBookCopyId(BookCopy bookCopyId) {
		this.bookCopyId = bookCopyId;
	}
	public LocalDate getIssueDate() {
		return issueDate;
	}
	public void setIssueDate(LocalDate issueDate) {
		this.issueDate = issueDate;
	}
	public LocalDate getDueDate() {
		return dueDate;
	}
	public void setDueDate(LocalDate dueDate) {
		this.dueDate = dueDate;
	}
	public Double getFine() {
		return fine;
	}
	public void setFine(Double fine) {
		this.fine = fine;
	}
	public Double getPaidAmount() {
		return paidAmount;
	}
	public void setPaidAmount(Double paidAmount) {
		this.paidAmount = paidAmount;
	}
	public Double getBalanceAmount() {
		return balanceAmount;
	}
	public void setBalanceAmount(Double balanceAmount) {
		this.balanceAmount = balanceAmount;
	}
	public String getFineStatus() {
		return fineStatus;
	}
	public void setFineStatus(String fineStatus) {
		this.fineStatus = fineStatus;
	}
	public String getRecordStatus() {
		return recordStatus;
	}
	public void setRecordStatus(String recordStatus) {
		this.recordStatus = recordStatus;
	}
	public LocalDate getReturnDate() {
		return returnDate;
	}
	public void setReturnDate(LocalDate returnDate) {
		this.returnDate = returnDate;
	}
	
}
