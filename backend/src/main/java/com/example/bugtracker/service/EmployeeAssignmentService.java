package com.example.bugtracker.service;

public interface EmployeeAssignmentService {
    /**
     * Validates that an employee exists in the database.
     * 
     * @param employeeName The employee name to validate
     * @return true if employee exists, false otherwise
     */
    boolean validateEmployee(String employeeName);
}

