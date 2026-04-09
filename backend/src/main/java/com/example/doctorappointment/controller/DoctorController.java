package com.example.doctorappointment.controller;

import com.example.doctorappointment.model.Doctor;
import com.example.doctorappointment.repository.DoctorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorRepository doctorRepository;

    public DoctorController(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody Doctor updatedDoctor) {
        Optional<Doctor> existingOpt = doctorRepository.findById(id);
        if (existingOpt.isPresent()) {
            Doctor existing = existingOpt.get();
            if (updatedDoctor.getName() != null) existing.setName(updatedDoctor.getName());
            if (updatedDoctor.getEmail() != null) existing.setEmail(updatedDoctor.getEmail());
            if (updatedDoctor.getSpecialization() != null) existing.setSpecialization(updatedDoctor.getSpecialization());
            if (updatedDoctor.getExperience() != null) existing.setExperience(updatedDoctor.getExperience());
            if (updatedDoctor.getMode() != null) existing.setMode(updatedDoctor.getMode());
            
            doctorRepository.save(existing);
            return ResponseEntity.ok(Map.of("message", "Profile updated successfully", "user", existing));
        }
        return ResponseEntity.notFound().build();
    }
}
