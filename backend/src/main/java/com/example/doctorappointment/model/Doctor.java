package com.example.doctorappointment.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(unique=true)
    private String email;
    private String specialization;
    private Integer experience;
    private String mode; // offline, online, both
    @Column(unique=true)
    private String username;
    private String password;
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED
}
