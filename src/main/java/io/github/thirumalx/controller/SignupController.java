/**
 * 
 */
package io.github.thirumalx.controller;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.github.thirumalx.exception.BadRequestException;
import io.github.thirumalx.model.Scope;
import io.github.thirumalx.model.UserResource;
import io.github.thirumalx.service.UserService;
import jakarta.validation.Valid;

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

    // TODO Captcha protection is needed
    @PostMapping(value = "/signup", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> doSignupJson(@RequestBody @Valid UserResource userResource,
            @RequestParam(value = "client_id", required = false) String clientId) {
        return handleSignup(userResource, clientId);
    }

    private ResponseEntity<?> handleSignup(UserResource userResource, String clientId) {
        logger.debug("doSignup {}", userResource);

        if (userResource.getRegisteredClientId() == null && clientId != null) {
            userResource.setRegisteredClientId(clientId);
        }

        // Set authorities based on client_id
        userResource.setAuthorities(Scope.getDefaultAuthoritiesByClient(userResource.getRegisteredClientId()));

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
