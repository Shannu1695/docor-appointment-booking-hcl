package com.example.doctorappointment.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    private String startTime;
    private String endTime;

    private String status = "PENDING"; // PENDING, ACCEPTED, REJECTED, CANCELLED
    private String rejectReason;
}
