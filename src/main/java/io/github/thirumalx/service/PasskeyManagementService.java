package io.github.thirumalx.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import io.github.thirumalx.security.AuthenticationFacade;

/**
 * @author ThirumalM
 *         Service for managing WebAuthn passkeys (credentials) for the
 *         currently authenticated user.
 *         Provides methods to list and delete registered passkeys.
 */
@Service
public class PasskeyManagementService {

    private final Logger logger = LoggerFactory.getLogger(PasskeyManagementService.class);
    private final JdbcTemplate jdbcTemplate;
    private final AuthenticationFacade authenticationFacade;

    public PasskeyManagementService(JdbcTemplate jdbcTemplate, AuthenticationFacade authenticationFacade) {
        this.jdbcTemplate = jdbcTemplate;
        this.authenticationFacade = authenticationFacade;
    }

    /**
     * Lists all registered passkeys for the currently authenticated user.
     * 
     * @return A list of maps representing the registered passkeys.
     */
    public List<Map<String, Object>> listCredentials() {
        String userUuid = authenticationFacade.getCurrentUserUuid().toString();
        logger.debug("Listing registered WebAuthn credentials for user: {}", userUuid);
        Map<String, Object> userInfo = null;
        try {
            userInfo = jdbcTemplate.queryForMap(
                    "SELECT id, name, display_name FROM public.user_entities WHERE name = ? ", userUuid);
        } catch (EmptyResultDataAccessException e) {
            logger.debug("No user found for user UUID: {}", userUuid);
            return new ArrayList<Map<String, Object>>();
        }
        List<Map<String, Object>> credentials = new ArrayList<Map<String, Object>>();
        if (userInfo != null) {
            credentials = jdbcTemplate.queryForList(
                    "SELECT id, label, created, last_used, public_key_credential_type FROM public.user_credentials WHERE user_entity_user_id = ? ORDER BY created DESC",
                    userInfo.get("id"));
        }
        return credentials;
    }

    /**
     * Deletes a registered passkey by ID for the currently authenticated user.
     *
     * @param id The ID of the credential to delete.
     * @return true if the credential was deleted, false if not found or not owned
     *         by the user.
     */
    public boolean deleteCredential(String id) {
        String userUuid = authenticationFacade.getCurrentUserUuid().toString();
        logger.debug("Deleting WebAuthn credential ID: {} for user: {}", id, userUuid);
        int rows = jdbcTemplate.update(
                "DELETE FROM public.user_credentials WHERE id = ? AND user_entity_user_id = ?",
                id,
                userUuid);
        return rows > 0;
    }
}
