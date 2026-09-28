package com.example.garage.controller;

import com.example.garage.model.Vehicle;
import com.example.garage.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    @GetMapping
    public List<Vehicle> getAll() {
        return vehicleService.getAll();
    }

    @GetMapping("/{id}")
    public Vehicle getById(@PathVariable Long id) {
        return vehicleService.getById(id);
    }

    @PostMapping
    public Vehicle create(@RequestBody Vehicle vehicle) {
        return vehicleService.save(vehicle);
    }

    @PutMapping("/{id}")
    public Vehicle update(@PathVariable Long id, @RequestBody Vehicle vehicle) {
        vehicle.setId(id);
        return vehicleService.save(vehicle);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        vehicleService.delete(id);
        return "Vehicle deleted";
    }
}