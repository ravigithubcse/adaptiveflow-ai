package com.adaptiveflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AdaptiveFlowApplication {
    public static void main(String[] args) {
        SpringApplication.run(AdaptiveFlowApplication.class, args);
    }
}
