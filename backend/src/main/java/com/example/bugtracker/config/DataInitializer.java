package com.example.bugtracker.config;

import com.example.bugtracker.model.AvailabilityStatus;
import com.example.bugtracker.model.Employee;
import com.example.bugtracker.repository.EmployeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    private final EmployeeRepository employeeRepository;

    public DataInitializer(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public void run(String... args) {
        if (employeeRepository.count() == 0) {
            logger.info("Initializing employee data...");
            
            employeeRepository.save(new Employee("John Doe", AvailabilityStatus.AVAILABLE));
            employeeRepository.save(new Employee("Emily Johnson", AvailabilityStatus.BUSY));
            employeeRepository.save(new Employee("Michael Brown", AvailabilityStatus.AVAILABLE));
            employeeRepository.save(new Employee("Sarah Miller", AvailabilityStatus.AVAILABLE));
            employeeRepository.save(new Employee("David Wilson", AvailabilityStatus.BUSY));
            employeeRepository.save(new Employee("Jessica Garcia", AvailabilityStatus.AVAILABLE));
            employeeRepository.save(new Employee("Daniel Martinez", AvailabilityStatus.BUSY));
            employeeRepository.save(new Employee("Olivia Anderson", AvailabilityStatus.AVAILABLE));
            employeeRepository.save(new Employee("Ethan Thomas", AvailabilityStatus.AVAILABLE));
            employeeRepository.save(new Employee("Sophia Robinson", AvailabilityStatus.BUSY));
            
            logger.info("Initialized {} employees", employeeRepository.count());
        } else {
            logger.info("Employee data already exists. Skipping initialization.");
        }
    }
}

