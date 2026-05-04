package com.adaptiveflow.repository;

import com.adaptiveflow.entity.CopilotConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CopilotConversationRepository extends JpaRepository<CopilotConversation, UUID> {
    List<CopilotConversation> findBySessionIdOrderByTimestampAsc(String sessionId);
}
