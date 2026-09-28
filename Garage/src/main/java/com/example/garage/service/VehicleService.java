package com.example.garage.service;

import com.example.garage.model.Vehicle;
import com.example.garage.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    public List<Vehicle> getAll() {
        return vehicleRepository.findAll();
    }

    public Vehicle getById(Long id) {
        return vehicleRepository.findById(id).orElse(null);
    }

    public Vehicle save(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public void delete(Long id) {
        vehicleRepository.deleteById(id);
    }
}