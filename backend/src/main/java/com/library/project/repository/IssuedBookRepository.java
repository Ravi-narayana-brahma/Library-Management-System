package com.library.project.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.library.project.entity.BookCopy;
import com.library.project.entity.IssuedBook;
import com.library.project.entity.Student;

@Repository
public interface IssuedBookRepository extends JpaRepository<IssuedBook, Long> {

    Optional<IssuedBook>
    findTopByBookCopyIdAndRecordStatus(BookCopy bookCopyId, String recordStatus); // active record for a copy


    @Query("""
        select
            s.studentName,
            b.bookName,
            bc.copyCode,
            ib.issueDate
        from IssuedBook ib
        join ib.student s
        join ib.bookCopyId bc
        join bc.book b
        order by ib.issueDate desc
    """)
    List<Object[]> findRecentIssuedRaw(); // recent issued list


    @Query("""
        select
            s.studentName,
            b.bookName,
            bc.copyCode,
            ib.issueDate
        from IssuedBook ib
        join ib.student s
        join ib.bookCopyId bc
        join bc.book b
        where function('date', ib.issueDate) = current_date
        order by ib.issueDate desc
    """)
    List<Object[]> findRecentIssuedToday(); // today issued list


    @Query("""
        select
            function('date', ib.issueDate),
            count(ib)
        from IssuedBook ib
        where function('date', ib.issueDate) = current_date
        group by function('date', ib.issueDate)
    """)
    List<Object[]> findIssuedGraphToday(); // today issue graph


    @Query("""
    	    select
    	        ib.dueDate,
    	        count(ib)
    	    from IssuedBook ib
    	    where ib.recordStatus = 'ISSUED'
    	      and ib.returnDate is null
    	      and ib.dueDate < current_date
    	    group by ib.dueDate
    	    order by ib.dueDate
    	""")
    	List<Object[]> findOverdueGraphToday();
 // today overdue graph


    @Query("""
        select
            s.studentName,
            b.bookName,
            bc.copyCode,
            ib.issueDate
        from IssuedBook ib
        join ib.student s
        join ib.bookCopyId bc
        join bc.book b
        where function('date', ib.issueDate) between :from and :to
        order by ib.issueDate desc
    """)
    List<Object[]> findRecentIssuedBetween(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    ); // recent issued between dates

    
    @Query("""
        select
            function('date', ib.issueDate),
            count(ib)
        from IssuedBook ib
        where function('date', ib.issueDate) between :from and :to
        group by function('date', ib.issueDate)
        order by function('date', ib.issueDate)
    """)
    List<Object[]> findIssuedGraphBetween(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    ); // issue graph between dates


    @Query("""
    	    select
    	        ib.dueDate,
    	        count(ib)
    	    from IssuedBook ib
    	    where ib.recordStatus = 'ISSUED'
    	      and ib.returnDate is null
    	      and ib.dueDate < current_date
    	      and ib.dueDate between :from and :to
    	    group by ib.dueDate
    	    order by ib.dueDate
    	""")
    	List<Object[]> findOverdueGraphBetween(
    	        @Param("from") LocalDate from,
    	        @Param("to") LocalDate to
    	); // overdue graph between dates


    @Query("""
        select
            b.bookName,
            count(ib)
        from IssuedBook ib
        join ib.bookCopyId bc
        join bc.book b
        group by b.bookName
        order by count(ib) desc
    """)
    List<Object[]> findTopBooksRaw(); // most issued books


    @Query("""
    	    select count(ib)
    	    from IssuedBook ib
    	    where ib.recordStatus = 'ISSUED'
    	      and ib.returnDate is null
    	      and ib.dueDate < current_date
    	""")
    	long countOverdueRaw(); // total overdue count


    @Query("""
        select count(ib)
        from IssuedBook ib
        where function('date', ib.issueDate) = current_date
    """)
    long countTodayIssuedRaw(); // today issued count


    @Query("""
        select bc.copyCode
        from IssuedBook ib
        join ib.bookCopyId bc
        where ib.recordStatus = 'ISSUED'
          and lower(bc.copyCode) like lower(concat('%', :key, '%'))
    """)
    List<String> searchIssuedCopyCodes(@Param("key") String key); // copy search
    
    List<IssuedBook> findByStudent_StudentIdOrderByIssueDateDesc(Long studentId);
    List<IssuedBook>
    findByStudent_StudentIdAndRecordStatusOrderByIssueDateDesc(
            Long studentId,
            String recordStatus
    );
    @Query("""
    	    select ib
    	    from IssuedBook ib
    	    join ib.bookCopyId bc
    	    join bc.book b
    	    where b.bookId = :bookId
    	    order by ib.issueDate desc
    	""")
    	List<IssuedBook> findByBookId(@Param("bookId") Long bookId);
    long countByStudentAndRecordStatus(Student student, String recordStatus);
    @Query("""
            SELECT i FROM IssuedBook i
            WHERE i.student.hallTicket = :hallTicket
            AND i.recordStatus = 'RETURNED'
        """)
        List<IssuedBook> findReturnedBooksByHallTicket(String hallTicket);
    List<IssuedBook> findByStudentAndFineGreaterThan(
            Student student,
            Double fine
    );
    List<IssuedBook> findByStudentAndRecordStatus(
            Student student,
            String recordStatus
    );
    @Query("""
    		   SELECT COALESCE(SUM(i.balanceAmount), 0)
    		   FROM IssuedBook i
    		   WHERE i.student = :student
    		   AND i.fineStatus <> 'PAID'
    		""")
    		double sumPendingFineByStudent(
    		        @Param("student") Student student
    		);

    

}
