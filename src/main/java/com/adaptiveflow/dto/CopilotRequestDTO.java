package com.adaptiveflow.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CopilotRequestDTO {
    private String sessionId;
    private String message;
    private List<String> contextProcessTypes;
}
