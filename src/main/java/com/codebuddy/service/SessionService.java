package com.codebuddy.service;

import com.codebuddy.model.CodeSession;
import com.codebuddy.repository.CodeSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service for managing coding sessions
 */
@Service
public class SessionService {

    @Autowired
    private CodeSessionRepository sessionRepository;

    public CodeSession createSession(String name, String ownerId, String language) {
        CodeSession session = new CodeSession(name, ownerId, language);
        return sessionRepository.save(session);
    }

    public Optional<CodeSession> getSession(String sessionId) {
        return sessionRepository.findById(sessionId);
    }

    public List<CodeSession> getUserSessions(String userId) {
        return sessionRepository.findByOwnerIdOrCollaboratorsContaining(userId, userId);
    }

    public List<CodeSession> getActiveSessions() {
        return sessionRepository.findByIsActiveTrue();
    }

    public CodeSession updateSessionCode(String sessionId, String filename, String content) {
        Optional<CodeSession> sessionOpt = sessionRepository.findById(sessionId);
        if (sessionOpt.isPresent()) {
            CodeSession session = sessionOpt.get();
            session.getFiles().put(filename, content);
            session.setUpdatedAt(LocalDateTime.now());
            return sessionRepository.save(session);
        }
        return null;
    }

    public CodeSession addCollaborator(String sessionId, String userId) {
        Optional<CodeSession> sessionOpt = sessionRepository.findById(sessionId);
        if (sessionOpt.isPresent()) {
            CodeSession session = sessionOpt.get();
            if (!session.getCollaborators().contains(userId)) {
                session.getCollaborators().add(userId);
                session.setUpdatedAt(LocalDateTime.now());
                return sessionRepository.save(session);
            }
        }
        return null;
    }

    public void deleteSession(String sessionId) {
        sessionRepository.deleteById(sessionId);
    }

    public CodeSession deactivateSession(String sessionId) {
        Optional<CodeSession> sessionOpt = sessionRepository.findById(sessionId);
        if (sessionOpt.isPresent()) {
            CodeSession session = sessionOpt.get();
            session.setActive(false);
            session.setUpdatedAt(LocalDateTime.now());
            return sessionRepository.save(session);
        }
        return null;
    }
}