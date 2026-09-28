package com.example.garage.service;

import com.example.garage.model.Bay;
import com.example.garage.repository.BayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BayService {

    @Autowired
    private BayRepository bayRepository;

    public List<Bay> getAll() {
        return bayRepository.findAll();
    }

    public Bay getById(Long id) {
        return bayRepository.findById(id).orElse(null);
    }

    public Bay save(Bay bay) {
        return bayRepository.save(bay);
    }

    public void delete(Long id) {
        bayRepository.deleteById(id);
    }
}