package com.example.garage.controller;

import com.example.garage.model.Bay;
import com.example.garage.service.BayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bays")
public class BayController {

    @Autowired
    private BayService bayService;

    @GetMapping
    public List<Bay> getAll() {
        return bayService.getAll();
    }

    @GetMapping("/{id}")
    public Bay getById(@PathVariable Long id) {
        return bayService.getById(id);
    }

    @PostMapping
    public Bay create(@RequestBody Bay bay) {
        return bayService.save(bay);
    }

    @PutMapping("/{id}")
    public Bay update(@PathVariable Long id, @RequestBody Bay bay) {
        bay.setId(id);
        return bayService.save(bay);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        bayService.delete(id);
        return "Bay deleted";
    }
}