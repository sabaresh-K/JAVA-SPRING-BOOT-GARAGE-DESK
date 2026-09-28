package com.example.garage.service;

import com.example.garage.model.Bay;
import com.example.garage.model.JobCard;
import com.example.garage.model.Mechanic;
import com.example.garage.model.Vehicle;
import com.example.garage.repository.BayRepository;
import com.example.garage.repository.JobCardRepository;
import com.example.garage.repository.MechanicRepository;
import com.example.garage.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class JobCardService {

    @Autowired
    private JobCardRepository jobCardRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private BayRepository bayRepository;

    @Autowired
    private MechanicRepository mechanicRepository;

    public List<JobCard> getAll() {
        return jobCardRepository.findAll();
    }

    public JobCard getById(Long id) {
        return jobCardRepository.findById(id).orElse(null);
    }

    public JobCard createJobCard(Long vehicleId, String requestedServices) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
        if (vehicle == null) {
            return null;
        }

        JobCard jobCard = new JobCard();
        jobCard.setVehicleId(vehicleId);
        jobCard.setRequestedServices(requestedServices);
        jobCard.setStatus("WAITING");
        jobCard.setCreatedAt(LocalDateTime.now());

        return jobCardRepository.save(jobCard);
    }

    public String assignJobCard(Long jobCardId, Long bayId, Long mechanicId) {
        JobCard jobCard = jobCardRepository.findById(jobCardId).orElse(null);
        Bay bay = bayRepository.findById(bayId).orElse(null);
        Mechanic mechanic = mechanicRepository.findById(mechanicId).orElse(null);

        if (jobCard == null || bay == null || mechanic == null) {
            return "Job card, bay or mechanic not found";
        }

        List<JobCard> activeJobs = jobCardRepository.findByBayIdAndStatusNot(bayId, "COMPLETED");
        if (!activeJobs.isEmpty()) {
            return "Bay already has an active job card";
        }

        jobCard.setBayId(bayId);
        jobCard.setMechanicId(mechanicId);
        jobCardRepository.save(jobCard);
        return "SUCCESS";
    }

    public String updateStatus(Long jobCardId, String newStatus) {
        JobCard jobCard = jobCardRepository.findById(jobCardId).orElse(null);
        if (jobCard == null) {
            return "Job card not found";
        }

        if (newStatus.equals("COMPLETED") && !jobCard.getStatus().equals("QUALITY_CHECK")) {
            return "Job card must pass quality-check before it can be completed";
        }

        jobCard.setStatus(newStatus);
        jobCardRepository.save(jobCard);
        return "SUCCESS";
    }
}