package com.adaptiveflow.repository;

import com.adaptiveflow.entity.ProcessPattern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProcessPatternRepository extends JpaRepository<ProcessPattern, UUID> {
    Optional<ProcessPattern> findByProcessType(String processType);
}
