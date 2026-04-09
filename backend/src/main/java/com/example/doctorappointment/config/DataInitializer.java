package com.example.doctorappointment.config;

import com.example.doctorappointment.model.Admin;
import com.example.doctorappointment.repository.AdminRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {
    @Bean
    public CommandLineRunner initData(AdminRepository adminRepository) {
        return args -> {
            if (adminRepository.count() == 0) {
                Admin admin = new Admin();
                admin.setUsername("admin");
                admin.setPassword("admin123");
                adminRepository.save(admin);
            }
        };
    }
}
