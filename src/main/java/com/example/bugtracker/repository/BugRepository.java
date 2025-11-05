package com.example.bugtracker.repository;

import com.example.bugtracker.model.Bug;
import com.example.bugtracker.model.BugPriority;
import com.example.bugtracker.model.BugStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BugRepository extends JpaRepository<Bug, Long> {
    List<Bug> findByStatus(BugStatus status);
    List<Bug> findByPriority(BugPriority priority);
}


