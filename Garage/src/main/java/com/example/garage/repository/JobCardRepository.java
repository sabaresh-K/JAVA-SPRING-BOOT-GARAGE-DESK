package com.example.garage.repository;

import com.example.garage.model.JobCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobCardRepository extends JpaRepository<JobCard, Long> {

    List<JobCard> findByBayIdAndStatusNot(Long bayId, String status);
}