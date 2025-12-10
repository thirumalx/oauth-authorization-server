/**
 * 
 */
package io.github.thirumalx.controller;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import io.github.thirumalx.model.ContactVerify;
import io.github.thirumalx.model.UserResource;
import io.github.thirumalx.repository.ContactRepository;
import io.github.thirumalx.service.UserService;

/**
 * @author ThirumalM
 */
@Controller
public class OtpController {

    Logger logger = LoggerFactory.getLogger(OtpController.class);

    final UserService userService;
    final ContactRepository contactRepository;

    public OtpController(UserService userService, ContactRepository contactRepository) {
        this.userService = userService;
        this.contactRepository = contactRepository;
    }

    /**
     * Show OTP verification page
     * 
     * @param loginUuid - UUID of the user who just signed up
     * @param model     - Spring MVC model
     * @return verify-otp template
     */
    @GetMapping("/verify-otp")
    public String showOtpPage(@RequestParam UUID loginUuid, Model model) {
        logger.debug("Showing OTP verification page for user: {}", loginUuid);

        // Get user details to display email and phone
        UserResource userResource = userService.get(loginUuid);

        model.addAttribute("loginUuid", loginUuid);
        model.addAttribute("email", userResource.getEmail());
        model.addAttribute("phoneNumber", userResource.getPhoneNumber());
        model.addAttribute("firstName", userResource.getFirstName());

        return "verify-otp";
    }

    /**
     * Verify OTP for both email and phone
     * 
     * @param loginUuid - UUID of the user
     * @param emailOtp  - OTP sent to email
     * @param phoneOtp  - OTP sent to phone
     * @param model     - Spring MVC model
     * @return redirect to consent page or back to verify-otp with error
     */
    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestParam UUID loginUuid,
            @RequestParam String emailOtp,
            @RequestParam String phoneOtp,
            Model model) {
        logger.debug("Verifying OTP for user: {}", loginUuid);

        try {
            // Get user details
            UserResource userResource = userService.get(loginUuid);

            // Verify email OTP
            ContactVerify emailVerify = ContactVerify.builder()
                    .contact(userResource.getEmail())
                    .otp(emailOtp)
                    .build();
            userService.verifyContact(emailVerify);
            logger.debug("Email OTP verified successfully for: {}", userResource.getEmail());

            // Verify phone OTP
            ContactVerify phoneVerify = ContactVerify.builder()
                    .contact(userResource.getPhoneNumber())
                    .otp(phoneOtp)
                    .build();
            userService.verifyContact(phoneVerify);
            logger.debug("Phone OTP verified successfully for: {}", userResource.getPhoneNumber());

            // Both OTPs verified successfully - redirect to OAuth consent
            // The consent page will be triggered by Spring Security OAuth2 when user
            // accesses /oauth2/authorize
            // For now, redirect to login with verified flag
            return "redirect:/login?verified=true";

        } catch (Exception e) {
            logger.error("OTP verification failed for user: {}", loginUuid, e);

            // Get user details again to repopulate the form
            UserResource userResource = userService.get(loginUuid);
            model.addAttribute("loginUuid", loginUuid);
            model.addAttribute("email", userResource.getEmail());
            model.addAttribute("phoneNumber", userResource.getPhoneNumber());
            model.addAttribute("firstName", userResource.getFirstName());
            model.addAttribute("error", e.getMessage());

            return "verify-otp";
        }
    }
}
