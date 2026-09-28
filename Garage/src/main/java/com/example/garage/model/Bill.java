package com.example.garage.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "bill")
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // id of the job card this bill belongs to
    private Long jobCardId;

    private Double partsCost;
    private Double labourCharges;
    private Double totalAmount;
    private LocalDateTime billDate;

    public Bill() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getJobCardId() {
        return jobCardId;
    }

    public void setJobCardId(Long jobCardId) {
        this.jobCardId = jobCardId;
    }

    public Double getPartsCost() {
        return partsCost;
    }

    public void setPartsCost(Double partsCost) {
        this.partsCost = partsCost;
    }

    public Double getLabourCharges() {
        return labourCharges;
    }

    public void setLabourCharges(Double labourCharges) {
        this.labourCharges = labourCharges;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public LocalDateTime getBillDate() {
        return billDate;
    }

    public void setBillDate(LocalDateTime billDate) {
        this.billDate = billDate;
    }
}