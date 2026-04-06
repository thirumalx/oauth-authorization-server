/**
 * 
 */
package io.github.thirumalx.controller;

import java.util.Map;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.github.thirumalx.exception.BadRequestException;
import io.github.thirumalx.model.UserResource;
import io.github.thirumalx.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

/**
 * @author ThirumalM
 */
@RestController
public class SignupController {

    Logger logger = LoggerFactory.getLogger(SignupController.class);

    private final UserService userService;

    public SignupController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Show signup page
     * Commented out: React SPA (ForwardController) now handles this GET request
     */
    /*
     * @GetMapping("/signup")
     * public String showSignupPage(@RequestParam(name = "client_id", required =
     * false) String registeredClientId,
     * Model model) {
     * logger.debug("showSignupPage with client_id: {}", registeredClientId);
     * UserResource userResource = new UserResource();
     * // Set registered client ID from request parameter (sent by BFF/React app)
     * userResource.setRegisteredClientId(registeredClientId);
     * model.addAttribute("userResource", userResource);
     * return "signup"; // Thymeleaf template name
     * }
     */

    /**
     * Get default authorities based on the registered client
     * Different clients may have different default scopes
     */
    private Set<SimpleGrantedAuthority> getDefaultAuthoritiesForClient(String clientId) {
        logger.debug("Getting default authorities for client: {}", clientId);
        return switch (clientId) {
            case "bff-client-id-001" -> Set.of(
                    new SimpleGrantedAuthority("SCOPE_openid"),
                    new SimpleGrantedAuthority("SCOPE_profile"),
                    new SimpleGrantedAuthority("SCOPE_message.read"),
                    new SimpleGrantedAuthority("SCOPE_message.write"));
            case "E-Auction" -> Set.of(
                    new SimpleGrantedAuthority("SCOPE_read"),
                    new SimpleGrantedAuthority("SCOPE_openid"),
                    new SimpleGrantedAuthority("SCOPE_profile"),
                    new SimpleGrantedAuthority("SCOPE_auction.bid"),
                    new SimpleGrantedAuthority("SCOPE_auction.view"));
            case "pkce", "pkcepostman" -> Set.of(
                    new SimpleGrantedAuthority("SCOPE_read"));
            default -> Set.of(
                    new SimpleGrantedAuthority("SCOPE_read"),
                    new SimpleGrantedAuthority("SCOPE_user"));
        };
    }

    // TODO Captcha protection is needed
    @PostMapping("/signup")
    public ResponseEntity<?> doSignup(@RequestBody @Valid UserResource userResource,
            @RequestParam(value = "client_id", required = false) String clientId) {
        logger.debug("doSignup {}", userResource);

        if (userResource.getRegisteredClientId() == null && clientId != null) {
            userResource.setRegisteredClientId(clientId);
        }

        // Set authorities based on client_id
        userResource.setAuthorities(getDefaultAuthoritiesForClient(userResource.getRegisteredClientId()));

        try {
            UserResource createdUser = userService.createAccount(userResource);
            logger.debug("Account created with id {}. Returning 201 Created", createdUser.getLoginUuid());
            return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
        } catch (BadRequestException e) {
            logger.error("Signup error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected signup error", e);
            return ResponseEntity.internalServerError().body(Map.of("message", "An unexpected error occurred. Please try again."));
        }
    }

}
