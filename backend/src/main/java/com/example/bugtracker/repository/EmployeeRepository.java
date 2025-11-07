package com.example.bugtracker.repository;

import com.example.bugtracker.model.AvailabilityStatus;
import com.example.bugtracker.model.Employee;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findByAvailabilityStatus(AvailabilityStatus status);
    
    Employee findByName(String name);
    
    @Query("SELECT e FROM Employee e WHERE e.availabilityStatus = :status ORDER BY e.name")
    List<Employee> findAvailableEmployees(AvailabilityStatus status);
}

