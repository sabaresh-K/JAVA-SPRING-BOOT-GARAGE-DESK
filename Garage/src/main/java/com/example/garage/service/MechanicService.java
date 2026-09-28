package com.example.garage.service;

import com.example.garage.model.Mechanic;
import com.example.garage.repository.MechanicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MechanicService {

    @Autowired
    private MechanicRepository mechanicRepository;

    public List<Mechanic> getAll() {
        return mechanicRepository.findAll();
    }

    public Mechanic getById(Long id) {
        return mechanicRepository.findById(id).orElse(null);
    }

    public Mechanic save(Mechanic mechanic) {
        return mechanicRepository.save(mechanic);
    }

    public void delete(Long id) {
        mechanicRepository.deleteById(id);
    }
}