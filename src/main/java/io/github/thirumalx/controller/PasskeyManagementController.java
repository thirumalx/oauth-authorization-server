package io.github.thirumalx.controller;

import io.github.thirumalx.service.PasskeyManagementService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller to list and manage registered WebAuthn Passkeys.
 *
 * @author Thirumal M
 */
@RestController
@RequestMapping("/webauthn/credentials")
public class PasskeyManagementController {

    private final Logger logger = LoggerFactory.getLogger(PasskeyManagementController.class);

    private final PasskeyManagementService passkeyManagementService;

    public PasskeyManagementController(PasskeyManagementService passkeyManagementService) {
        this.passkeyManagementService = passkeyManagementService;
    }

    /**
     * Lists all registered passkeys for the currently authenticated user.
     */
    @GetMapping("")
    public ResponseEntity<List<Map<String, Object>>> listCredentials() {        
        var credentials = passkeyManagementService.listCredentials();
        return ResponseEntity.ok(credentials);
    }

    /**
     * Deletes a registered passkey by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCredential(@PathVariable String id) {
        logger.debug("Request to delete WebAuthn credential with ID: {}", id);
        boolean deleted = passkeyManagementService.deleteCredential(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().build();
    }
}
