package com.example.bugtracker.controller;

import com.example.bugtracker.model.Bug;
import com.example.bugtracker.model.BugPriority;
import com.example.bugtracker.model.BugStatus;
import com.example.bugtracker.service.BugService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/bugs")
public class BugController {

    private final BugService bugService;

    public BugController(BugService bugService) { this.bugService = bugService; }

    @PostMapping
    public ResponseEntity<Bug> create(@RequestBody Bug bug) {
        Bug created = bugService.create(bug);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public List<Bug> getAll(
            @RequestParam(value = "status", required = false) BugStatus status,
            @RequestParam(value = "priority", required = false) BugPriority priority) {
        return bugService.getAll(status, priority);
    }

    @GetMapping("/{id}")
    public Bug getById(@PathVariable Long id) {
        Bug bug = bugService.getById(id);
        if (bug == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return bug;
    }

    @PutMapping("/{id}")
    public Bug update(@PathVariable Long id, @RequestBody Bug bug) {
        Bug updated = bugService.update(id, bug);
        if (updated == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return updated;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bugService.delete(id);
        return ResponseEntity.noContent().build();
    }
}


