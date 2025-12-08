/**
 * 
 */
package io.github.thirumalx.controller;

import java.beans.PropertyEditorSupport;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import io.github.thirumalx.model.UserResource;
import io.github.thirumalx.service.UserService;
import jakarta.validation.Valid;

/**
 * @author ThirumalM
 */
@Controller
public class SignupController {

    Logger logger = LoggerFactory.getLogger(SignupController.class);

    private final UserService userService;

    public SignupController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Custom date binder to convert HTML date input (YYYY-MM-DD) to OffsetDateTime
     */
    @InitBinder
    public void initBinder(WebDataBinder binder) {
        binder.registerCustomEditor(OffsetDateTime.class, new PropertyEditorSupport() {
            @Override
            public void setAsText(String text) throws IllegalArgumentException {
                if (text != null && !text.isEmpty()) {
                    LocalDate localDate = LocalDate.parse(text);
                    setValue(localDate.atStartOfDay(ZoneId.systemDefault()).toOffsetDateTime());
                }
            }
        });
    }

    /** Show signup page */
    @GetMapping("/signup")
    public String showSignupPage(
            @RequestParam(name = "client_id", required = false, defaultValue = "Thirumal") String registeredClientId,
            Model model) {
        logger.debug("showSignupPage with client_id: {}", registeredClientId);
        UserResource userResource = new UserResource();
        // Set registered client ID from request parameter (sent by BFF/React app)
        userResource.setRegisteredClientId(registeredClientId);
        model.addAttribute("userResource", userResource);
        return "signup"; // Thymeleaf template name
    }

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

    @PostMapping("/signup")
    public String doSignup(@ModelAttribute @Valid UserResource userResource,
            BindingResult bindingResult, Model model) {
        logger.debug("doSignup {}", userResource);
        // if (userService.existsByEmail(userResource.getEmail())) {
        // bindingResult.rejectValue("email", "error.userResource", "Email already
        // registered");
        // }

        if (bindingResult.hasErrors()) {
            return "signup"; // return to form with errors
        }
        // Set authorities based on client_id
        userResource.setAuthorities(getDefaultAuthoritiesForClient(userResource.getRegisteredClientId()));

        userService.createAccount(userResource);

        return "redirect:/login?signup=success"; // User logs in → OAuth2 flow starts automatically
    }

}
