package com.example.doctorappointment.controller;

import com.example.doctorappointment.model.Admin;
import com.example.doctorappointment.model.Doctor;
import com.example.doctorappointment.model.Patient;
import com.example.doctorappointment.repository.AdminRepository;
import com.example.doctorappointment.repository.DoctorRepository;
import com.example.doctorappointment.repository.PatientRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AdminRepository adminRepository;

    public AuthController(PatientRepository patientRepository, DoctorRepository doctorRepository, AdminRepository adminRepository) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.adminRepository = adminRepository;
    }

    @PostMapping("/patient/register")
    public ResponseEntity<?> registerPatient(@RequestBody Patient patient) {
        if (patientRepository.findByEmail(patient.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
        }
        patientRepository.save(patient);
        return ResponseEntity.ok(Map.of("message", "Patient registered successfully"));
    }

    @PostMapping("/patient/login")
    public ResponseEntity<?> loginPatient(@RequestBody Map<String, String> creds) {
        Optional<Patient> patient = patientRepository.findByEmailAndPassword(creds.get("email"), creds.get("password"));
        if (patient.isPresent()) {
            Map<String, Object> res = new HashMap<>();
            res.put("message", "Login successful");
            res.put("user", patient.get());
            res.put("role", "patient");
            return ResponseEntity.ok(res);
        }
        return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
    }

    @PostMapping("/doctor/register")
    public ResponseEntity<?> registerDoctor(@RequestBody Doctor doctor) {
        if (doctorRepository.findByUsername(doctor.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username already exists"));
        }
        doctor.setStatus("PENDING");
        doctorRepository.save(doctor);
        return ResponseEntity.ok(Map.of("message", "Sent for approval or approval in process"));
    }

    @PostMapping("/doctor/login")
    public ResponseEntity<?> loginDoctor(@RequestBody Map<String, String> creds) {
        Optional<Doctor> doctor = doctorRepository.findByUsernameAndPassword(creds.get("username"), creds.get("password"));
        if (doctor.isPresent()) {
            if (!"APPROVED".equals(doctor.get().getStatus())) {
                return ResponseEntity.status(403).body(Map.of("message", "Account is " + doctor.get().getStatus().toLowerCase()));
            }
            Map<String, Object> res = new HashMap<>();
            res.put("message", "Login successful");
            res.put("user", doctor.get());
            res.put("role", "doctor");
            return ResponseEntity.ok(res);
        }
        return ResponseEntity.status(401).body(Map.of("message", "Invalid username or password"));
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> loginAdmin(@RequestBody Map<String, String> creds) {
        Optional<Admin> admin = adminRepository.findByUsernameAndPassword(creds.get("username"), creds.get("password"));
        if (admin.isPresent()) {
            Map<String, Object> res = new HashMap<>();
            res.put("message", "Login successful");
            res.put("user", admin.get());
            res.put("role", "admin");
            return ResponseEntity.ok(res);
        }
        return ResponseEntity.status(401).body(Map.of("message", "Invalid username or password"));
    }
}
