package com.adaptiveflow.service;

import com.adaptiveflow.dto.CopilotRequestDTO;
import com.adaptiveflow.dto.CopilotResponseDTO;
import com.adaptiveflow.entity.CopilotConversation;
import com.adaptiveflow.repository.CopilotConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CopilotService {

    private final CopilotConversationRepository conversationRepository;
    private final AIService aiService;
    private final WebSocketMessagingService messagingService;

    @Transactional
    public CopilotResponseDTO processMessage(CopilotRequestDTO request) {
        CopilotConversation userMessage = CopilotConversation.builder()
                .id(UUID.randomUUID())
                .sessionId(request.getSessionId())
                .role("user")
                .content(request.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
        conversationRepository.save(userMessage);

        String aiResponse = aiService.answerNaturalLanguageQuery(
                request.getMessage(), 
                request.getContextProcessTypes() != null ? request.getContextProcessTypes() : List.of("ALL")
        );

        CopilotConversation aiMessage = CopilotConversation.builder()
                .id(UUID.randomUUID())
                .sessionId(request.getSessionId())
                .role("assistant")
                .content(aiResponse)
                .aiToolCalls("{} {} {} " + (request.getContextProcessTypes() != null ? String.join(",", request.getContextProcessTypes()) : "ALL"))
                .timestamp(LocalDateTime.now())
                .build();
        conversationRepository.save(aiMessage);

        CopilotResponseDTO response = CopilotResponseDTO.builder()
                .sessionId(request.getSessionId())
                .message(request.getMessage())
                .aiResponse(aiResponse)
                .timestamp(LocalDateTime.now())
                .requiresAction(aiResponse.toLowerCase().contains("recommend") || aiResponse.toLowerCase().contains("action"))
                .suggestedAction(extractAction(aiResponse))
                .build();

        messagingService.broadcastUpdate("copilot", "COPILOT_MESSAGE", response);
        return response;
    }

    public List<CopilotConversation> getConversationHistory(String sessionId) {
        return conversationRepository.findBySessionIdOrderByTimestampAsc(sessionId);
    }

    private String extractAction(String aiResponse) {
        if (aiResponse.contains("scale")) return "SCALE_RESOURCES";
        if (aiResponse.contains("alert")) return "ALERT_TEAM";
        if (aiResponse.contains("investigate")) return "INVESTIGATE";
        return null;
    }
}
