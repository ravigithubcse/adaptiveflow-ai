package com.adaptiveflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "copilot_conversations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CopilotConversation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String sessionId;
    
    @Column(nullable = false)
    private String role;
    
    @Column(nullable = false, length = 4000)
    private String content;
    
    @Column(length = 2000)
    private String referencedData;
    
    @Column(length = 2000)
    private String aiToolCalls;
    
    private LocalDateTime timestamp;
    
    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
