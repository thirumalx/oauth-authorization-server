/**
 * 
 */
package io.github.thirumalx.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.github.thirumalx.model.ContactVerify;
import io.github.thirumalx.model.UserResource;
import io.github.thirumalx.repository.ContactRepository;
import io.github.thirumalx.service.UserService;

/**
 * @author ThirumalM
 */
@RestController
@RequestMapping("/otp")
public class OtpController {

    Logger logger = LoggerFactory.getLogger(OtpController.class);

    final UserService userService;
    final ContactRepository contactRepository;

    public OtpController(UserService userService, ContactRepository contactRepository) {
        this.userService = userService;
        this.contactRepository = contactRepository;
    }

    /**
     * Get user details to display on OTP page
     */
    @GetMapping("/user-info/{loginUuid}")
    public ResponseEntity<?> getUserInfo(@PathVariable UUID loginUuid) {
        logger.debug("Fetching user info for OTP screen: {}", loginUuid);
        try {
            UserResource userResource = userService.get(loginUuid);
            return ResponseEntity.ok(Map.of(
                "email", userResource.getEmail(),
                "phoneNumber", userResource.getPhoneNumber(),
                "firstName", userResource.getFirstName()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }
    }

    /**
     * Verify a single contact (email or phone)
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody ContactVerify contactVerify) {
        logger.debug("Verifying contact: {}", contactVerify.getContact());
        try {
            boolean verified = userService.verifyContact(contactVerify);
            return ResponseEntity.ok(Map.of("verified", verified));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Verify both email and phone at once (signup flow)
     */
    @PostMapping("/verify-combined")
    public ResponseEntity<?> verifyCombined(@RequestBody Map<String, String> request) {
        UUID loginUuid = UUID.fromString(request.get("loginUuid"));
        String emailOtp = request.get("emailOtp");
        String phoneOtp = request.get("phoneOtp");
        
        logger.debug("Combined OTP verification for user: {}", loginUuid);

        try {
            UserResource userResource = userService.get(loginUuid);

            // Verify email OTP
            userService.verifyContact(ContactVerify.builder()
                    .contact(userResource.getEmail())
                    .otp(emailOtp)
                    .build());

            // Verify phone OTP
            userService.verifyContact(ContactVerify.builder()
                    .contact(userResource.getPhoneNumber())
                    .otp(phoneOtp)
                    .build());

            return ResponseEntity.ok(Map.of("message", "Account verified successfully"));
        } catch (Exception e) {
            logger.error("Combined OTP verification failed", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Resend OTP
     */
    @PostMapping("/resend")
    public ResponseEntity<?> resend(@RequestBody Map<String, Object> payload) {
        String purpose = payload.getOrDefault("purpose", "verify-signup").toString();
        logger.debug("Resending OTP for {} with purpose: {}", payload.get("loginId"), purpose);
        try {
            boolean sent = userService.requestOtp(payload, purpose);
            return ResponseEntity.ok(Map.of("sent", sent));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
