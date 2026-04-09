package com.example.doctorappointment.service;

import com.example.doctorappointment.model.Appointment;
import com.example.doctorappointment.repository.AppointmentRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class AppointmentReminderService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentReminderService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    // Runs every 1 minute
    @Scheduled(fixedRate = 60000)
    public void sendReminders() {
        List<Appointment> acceptedAppointments = appointmentRepository.findAll().stream()
                .filter(a -> "ACCEPTED".equals(a.getStatus()))
                .toList();

        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");

        for (Appointment appt : acceptedAppointments) {
            try {
                LocalDateTime startTime = LocalDateTime.parse(appt.getStartTime(), formatter);
                long minutesUntil = ChronoUnit.MINUTES.between(now, startTime);

                // If appointment is exactly between 29 and 30 minutes away
                if (minutesUntil == 30) {
                    System.out.println("======================================================");
                    System.out.println("EMAIL NOTIFICATION TO PATIENT: " + appt.getPatient().getEmail());
                    System.out.println("Subject: Appointment Reminder");
                    System.out.println("Dear " + appt.getPatient().getName() + ",");
                    System.out.println("This is a reminder that your appointment with Dr. " + appt.getDoctor().getName());
                    System.out.println("is starting in 30 minutes at " + appt.getStartTime() + ".");
                    System.out.println("======================================================");
                }
            } catch (Exception e) {
                // Ignore parsing errors or invalid formats, in real life we would handle properly
            }
        }
    }
}
