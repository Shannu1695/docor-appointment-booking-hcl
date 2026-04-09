package com.example.doctorappointment.controller;

import com.example.doctorappointment.model.Appointment;
import com.example.doctorappointment.model.Doctor;
import com.example.doctorappointment.model.Patient;
import com.example.doctorappointment.repository.AppointmentRepository;
import com.example.doctorappointment.repository.DoctorRepository;
import com.example.doctorappointment.repository.PatientRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    public AppointmentController(AppointmentRepository appointmentRepository, DoctorRepository doctorRepository, PatientRepository patientRepository) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
    }

    @GetMapping("/specializations")
    public ResponseEntity<List<String>> getSpecializations() {
        return ResponseEntity.ok(doctorRepository.findDistinctSpecializations());
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<Doctor>> getDoctorsBySpec(@RequestParam String specialization, @RequestParam(required = false) String mode) {
        List<Doctor> doctors = doctorRepository.findByStatusAndSpecialization("APPROVED", specialization);
        if (mode != null && !mode.isEmpty()) {
            doctors = doctors.stream().filter(d -> {
                if (d.getMode() == null) return false;
                if (d.getMode().equalsIgnoreCase("both")) return true;
                if (mode.equalsIgnoreCase("both")) return d.getMode().equalsIgnoreCase("both");
                return d.getMode().equalsIgnoreCase(mode);
            }).collect(Collectors.toList());
        }
        return ResponseEntity.ok(doctors);
    }

    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(@RequestBody Map<String, Object> payload) {
        try {
            Long doctorId = Long.valueOf(payload.get("doctorId").toString());
            Long patientId = Long.valueOf(payload.get("patientId").toString());
            String startTime = payload.get("startTime").toString();
            String endTime = payload.get("endTime").toString();

            Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
            Optional<Patient> patientOpt = patientRepository.findById(patientId);

            if (doctorOpt.isPresent() && patientOpt.isPresent()) {
                Appointment appt = new Appointment();
                appt.setDoctor(doctorOpt.get());
                appt.setPatient(patientOpt.get());
                appt.setStartTime(startTime);
                appt.setEndTime(endTime);
                appt.setStatus("PENDING");
                appointmentRepository.save(appt);
                return ResponseEntity.ok(Map.of("message", "Appointment booked successfully"));
            }
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid doctor or patient"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error booking appointment"));
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getPatientAppointments(@PathVariable Long patientId) {
        return ResponseEntity.ok(appointmentRepository.findByPatientId(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getDoctorAppointments(@PathVariable Long doctorId) {
        return ResponseEntity.ok(appointmentRepository.findByDoctorId(doctorId));
    }

    @PostMapping("/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Optional<Appointment> apptOpt = appointmentRepository.findById(id);
        if (apptOpt.isPresent()) {
            Appointment appt = apptOpt.get();
            appt.setStatus(payload.get("status")); // ACCEPTED or REJECTED
            if (payload.containsKey("reason")) {
                appt.setRejectReason(payload.get("reason"));
            }
            appointmentRepository.save(appt);
            return ResponseEntity.ok(Map.of("message", "Appointment status updated"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/reschedule")
    public ResponseEntity<?> rescheduleAppointment(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Optional<Appointment> apptOpt = appointmentRepository.findById(id);
        if (apptOpt.isPresent()) {
            Appointment appt = apptOpt.get();
            appt.setStartTime(payload.get("startTime"));
            appt.setEndTime(payload.get("endTime"));
            appt.setStatus("PENDING");
            appt.setRejectReason(null);
            appointmentRepository.save(appt);
            return ResponseEntity.ok(Map.of("message", "Appointment rescheduled and sent for approval"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id) {
        Optional<Appointment> apptOpt = appointmentRepository.findById(id);
        if (apptOpt.isPresent()) {
            Appointment appt = apptOpt.get();
            appt.setStatus("CANCELLED");
            appointmentRepository.save(appt);
            return ResponseEntity.ok(Map.of("message", "Appointment cancelled successfully"));
        }
        return ResponseEntity.notFound().build();
    }
}
