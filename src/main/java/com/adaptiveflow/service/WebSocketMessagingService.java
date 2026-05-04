package com.adaptiveflow.service;

import com.adaptiveflow.dto.RealTimeUpdateDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketMessagingService {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    public void broadcastUpdate(String topic, String updateType, Object payload) {
        try {
            RealTimeUpdateDTO update = RealTimeUpdateDTO.builder()
                    .updateType(updateType)
                    .payload(payload)
                    .timestamp(System.currentTimeMillis())
                    .metadata(Map.of("source", "adaptiveflow-engine"))
                    .build();
            
            messagingTemplate.convertAndSend("/topic/" + topic, update);
        } catch (Exception e) {
            log.error("Error broadcasting update: {}", e.getMessage());
        }
    }

    public void sendToUser(String user, String topic, Object payload) {
        messagingTemplate.convertAndSendToUser(user, "/queue/" + topic, payload);
    }
}
