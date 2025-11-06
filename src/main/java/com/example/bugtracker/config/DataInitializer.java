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
            
            employeeRepository.save(new Employee("Alice Johnson", AvailabilityStatus.AVAILABLE));
            employeeRepository.save(new Employee("Bob Smith", AvailabilityStatus.AVAILABLE));
            employeeRepository.save(new Employee("Charlie Brown", AvailabilityStatus.BUSY));
            employeeRepository.save(new Employee("Diana Prince", AvailabilityStatus.AVAILABLE));
            employeeRepository.save(new Employee("Ethan Hunt", AvailabilityStatus.BUSY));
            employeeRepository.save(new Employee("Fiona Chen", AvailabilityStatus.AVAILABLE));
            employeeRepository.save(new Employee("George Wilson", AvailabilityStatus.AVAILABLE));
            employeeRepository.save(new Employee("Hannah Martinez", AvailabilityStatus.BUSY));
            employeeRepository.save(new Employee("Ian Thompson", AvailabilityStatus.AVAILABLE));
            employeeRepository.save(new Employee("Julia Roberts", AvailabilityStatus.AVAILABLE));
            
            logger.info("Initialized {} employees", employeeRepository.count());
        } else {
            logger.info("Employee data already exists. Skipping initialization.");
        }
    }
}

