package com.example.garage.repository;

import com.example.garage.model.Bay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BayRepository extends JpaRepository<Bay, Long> {
}