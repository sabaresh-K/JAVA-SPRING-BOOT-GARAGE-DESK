package com.example.garage.service;

import com.example.garage.model.Bill;
import com.example.garage.model.JobCard;
import com.example.garage.repository.BillRepository;
import com.example.garage.repository.JobCardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BillService {

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private JobCardRepository jobCardRepository;

    public List<Bill> getAll() {
        return billRepository.findAll();
    }


    public String generateBill(Long jobCardId, Double partsCost, Double labourCharges) {
        JobCard jobCard = jobCardRepository.findById(jobCardId).orElse(null);

        if (jobCard == null || !jobCard.getStatus().equals("COMPLETED")) {
            return "Bill can only be generated for a completed job card";
        }

        Bill bill = new Bill();
        bill.setJobCardId(jobCardId);
        bill.setPartsCost(partsCost);
        bill.setLabourCharges(labourCharges);
        bill.setTotalAmount(partsCost + labourCharges);
        bill.setBillDate(LocalDateTime.now());

        billRepository.save(bill);
        return "SUCCESS";
    }
}