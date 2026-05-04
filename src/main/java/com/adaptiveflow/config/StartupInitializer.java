package com.adaptiveflow.config;

import com.adaptiveflow.service.DataSimulationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class StartupInitializer implements ApplicationRunner {

    private final DataSimulationService simulationService;

    @Override
    public void run(ApplicationArguments args) {
        log.info("Initializing AdaptiveFlow AI - Cognitive Process Intelligence Engine...");
        simulationService.initializePatterns();
        log.info("Process patterns initialized. System ready.");
    }
}
