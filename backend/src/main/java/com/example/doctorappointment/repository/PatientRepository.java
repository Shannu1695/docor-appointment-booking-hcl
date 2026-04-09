package com.example.doctorappointment.repository;
import com.example.doctorappointment.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByEmailAndPassword(String email, String password);
    Optional<Patient> findByEmail(String email);
}
