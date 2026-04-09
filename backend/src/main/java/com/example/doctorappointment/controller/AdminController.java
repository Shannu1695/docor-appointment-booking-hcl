package com.example.doctorappointment.controller;

import com.example.doctorappointment.model.Doctor;
import com.example.doctorappointment.repository.DoctorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final DoctorRepository doctorRepository;

    public AdminController(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    @GetMapping("/doctors/pending")
    public ResponseEntity<List<Doctor>> getPendingDoctors() {
        return ResponseEntity.ok(doctorRepository.findByStatus("PENDING"));
    }

    @PostMapping("/doctors/{id}/approve")
    public ResponseEntity<?> approveDoctor(@PathVariable Long id) {
        Optional<Doctor> doctorOpt = doctorRepository.findById(id);
        if (doctorOpt.isPresent()) {
            Doctor doctor = doctorOpt.get();
            doctor.setStatus("APPROVED");
            doctorRepository.save(doctor);
            return ResponseEntity.ok(Map.of("message", "Doctor approved successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/doctors/{id}/reject")
    public ResponseEntity<?> rejectDoctor(@PathVariable Long id) {
        Optional<Doctor> doctorOpt = doctorRepository.findById(id);
        if (doctorOpt.isPresent()) {
            Doctor doctor = doctorOpt.get();
            doctor.setStatus("REJECTED");
            doctorRepository.save(doctor);
            return ResponseEntity.ok(Map.of("message", "Doctor rejected successfully"));
        }
        return ResponseEntity.notFound().build();
    }
}
