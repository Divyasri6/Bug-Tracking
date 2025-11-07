package com.example.bugtracker.service;

import com.example.bugtracker.model.Bug;
import com.example.bugtracker.model.BugPriority;
import com.example.bugtracker.model.BugStatus;
import java.util.List;

public interface BugService {
    Bug create(Bug bug);
    List<Bug> getAll(BugStatus status, BugPriority priority);
    Bug getById(Long id);
    Bug update(Long id, Bug bug);
    void delete(Long id);
}


