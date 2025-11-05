package com.example.bugtracker.service.impl;

import com.example.bugtracker.model.Bug;
import com.example.bugtracker.model.BugPriority;
import com.example.bugtracker.model.BugStatus;
import com.example.bugtracker.repository.BugRepository;
import com.example.bugtracker.service.BugService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BugServiceImpl implements BugService {

    private final BugRepository bugRepository;

    public BugServiceImpl(BugRepository bugRepository) {
        this.bugRepository = bugRepository;
    }

    @Override
    public Bug create(Bug bug) {
        // Set defaults if not provided (before @PrePersist runs)
        if (bug.getStatus() == null) {
            bug.setStatus(BugStatus.OPEN);
        }
        if (bug.getPriority() == null) {
            bug.setPriority(BugPriority.MEDIUM);
        }
        // Dates will be set automatically by @PrePersist
        return bugRepository.save(bug);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Bug> getAll(BugStatus status, BugPriority priority) {
        if (status != null) {
            return bugRepository.findByStatus(status);
        }
        if (priority != null) {
            return bugRepository.findByPriority(priority);
        }
        return bugRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Bug getById(Long id) {
        return bugRepository.findById(id).orElse(null);
    }

    @Override
    public Bug update(Long id, Bug updates) {
        Bug existing = bugRepository.findById(id).orElse(null);
        if (existing == null) { return null; }
        // Update only provided fields
        if (updates.getTitle() != null) {
            existing.setTitle(updates.getTitle());
        }
        if (updates.getDescription() != null) {
            existing.setDescription(updates.getDescription());
        }
        if (updates.getStatus() != null) {
            existing.setStatus(updates.getStatus());
        }
        if (updates.getPriority() != null) {
            existing.setPriority(updates.getPriority());
        }
        if (updates.getAssignedTo() != null) {
            existing.setAssignedTo(updates.getAssignedTo());
        }
        // updatedDate will be set by @PreUpdate
        return bugRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        bugRepository.deleteById(id);
    }
}


