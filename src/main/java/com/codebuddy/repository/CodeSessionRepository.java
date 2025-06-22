package com.codebuddy.repository;

import com.codebuddy.model.CodeSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for CodeSession entities
 */
@Repository
public interface CodeSessionRepository extends MongoRepository<CodeSession, String> {
    List<CodeSession> findByOwnerIdOrCollaboratorsContaining(String ownerId, String collaboratorId);
    List<CodeSession> findByIsActiveTrue();
    List<CodeSession> findByOwnerIdAndIsActiveTrue(String ownerId);
}