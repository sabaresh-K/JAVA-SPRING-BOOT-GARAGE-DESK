package com.example.garage.controller;

import com.example.garage.model.Bill;
import com.example.garage.service.BillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BillController {

    @Autowired
    private BillService billService;

    @PostMapping("/jobcards/{id}/bill")
    public String generateBill(@PathVariable Long id, @RequestParam Double partsCost, @RequestParam Double labourCharges) {
        String result = billService.generateBill(id, partsCost, labourCharges);

        if (result.equals("SUCCESS")) {
            return "Bill generated successfully";
        }
        return result;
    }

    @GetMapping("/bills")
    public List<Bill> getAll() {
        return billService.getAll();
    }
}