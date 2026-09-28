package com.example.garage.controller;

import com.example.garage.model.Mechanic;
import com.example.garage.service.MechanicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mechanics")
public class MechanicController {

    @Autowired
    private MechanicService mechanicService;

    @GetMapping
    public List<Mechanic> getAll() {
        return mechanicService.getAll();
    }

    @GetMapping("/{id}")
    public Mechanic getById(@PathVariable Long id) {
        return mechanicService.getById(id);
    }

    @PostMapping
    public Mechanic create(@RequestBody Mechanic mechanic) {
        return mechanicService.save(mechanic);
    }

    @PutMapping("/{id}")
    public Mechanic update(@PathVariable Long id, @RequestBody Mechanic mechanic) {
        mechanic.setId(id);
        return mechanicService.save(mechanic);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        mechanicService.delete(id);
        return "Mechanic deleted";
    }
}