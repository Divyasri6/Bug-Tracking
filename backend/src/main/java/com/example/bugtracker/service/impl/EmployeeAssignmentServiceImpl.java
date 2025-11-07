package com.example.bugtracker.service.impl;

import com.example.bugtracker.model.Employee;
import com.example.bugtracker.repository.EmployeeRepository;
import com.example.bugtracker.service.EmployeeAssignmentService;
import org.springframework.stereotype.Service;

@Service
public class EmployeeAssignmentServiceImpl implements EmployeeAssignmentService {

    private final EmployeeRepository employeeRepository;

    public EmployeeAssignmentServiceImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public boolean validateEmployee(String employeeName) {
        if (employeeName == null || employeeName.trim().isEmpty()) {
            return false;
        }
        Employee employee = employeeRepository.findByName(employeeName.trim());
        return employee != null;
    }
}
