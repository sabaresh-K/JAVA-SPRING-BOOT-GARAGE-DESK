package com.example.garage.controller;

import com.example.garage.model.JobCard;
import com.example.garage.service.JobCardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobcards")
public class JobCardController {

    @Autowired
    private JobCardService jobCardService;


    @GetMapping
    public List<JobCard> getAll() {
        return jobCardService.getAll();
    }

    @GetMapping("/{id}")
    public JobCard getById(@PathVariable Long id) {
        return jobCardService.getById(id);
    }

    @PostMapping
    public JobCard create(@RequestParam Long vehicleId, @RequestParam String requestedServices) {
        return jobCardService.createJobCard(vehicleId, requestedServices);
    }

    @PutMapping("/{id}/assign")
    public String assign(@PathVariable Long id, @RequestParam Long bayId, @RequestParam Long mechanicId) {
        String result = jobCardService.assignJobCard(id, bayId, mechanicId);

        if (result.equals("SUCCESS")) {
            return "Bay and mechanic assigned successfully";
        }
        return result;
    }

    @PutMapping("/{id}/status")
    public String updateStatus(@PathVariable Long id, @RequestParam String newStatus) {
        String result = jobCardService.updateStatus(id, newStatus);

        if (result.equals("SUCCESS")) {
            return "Status changed to " + newStatus;
        }
        return result;
    }
}