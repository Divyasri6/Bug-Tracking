package com.example.Bug.Tracking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {"com.example.bugtracker", "com.example.Bug.Tracking"})
@EnableJpaRepositories(basePackages = "com.example.bugtracker.repository")
@EntityScan(basePackages = "com.example.bugtracker.model")
public class BugTrackingApplication {

	public static void main(String[] args) {
		SpringApplication.run(BugTrackingApplication.class, args);
	}

}
