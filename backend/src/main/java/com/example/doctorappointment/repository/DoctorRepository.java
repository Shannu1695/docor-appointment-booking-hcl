package com.example.doctorappointment.repository;
import com.example.doctorappointment.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUsernameAndPassword(String username, String password);
    Optional<Doctor> findByUsername(String username);
    java.util.List<Doctor> findByStatus(String status);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT d.specialization FROM Doctor d WHERE d.status = 'APPROVED'")
    java.util.List<String> findDistinctSpecializations();

    java.util.List<Doctor> findByStatusAndSpecialization(String status, String specialization);
}
