package com.adaptiveflow.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CopilotResponseDTO {
    private String sessionId;
    private String message;
    private String aiResponse;
    private String referencedData;
    private LocalDateTime timestamp;
    private boolean requiresAction;
    private String suggestedAction;
}
