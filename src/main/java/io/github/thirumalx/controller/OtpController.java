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

import io.github.thirumalx.model.Contact;
import io.github.thirumalx.model.Mfa;
import io.github.thirumalx.model.ContactVerify;
import io.github.thirumalx.model.UserResource;
import io.github.thirumalx.repository.ContactRepository;
import io.github.thirumalx.repository.MfaRepository;
import io.github.thirumalx.service.UserService;
import io.github.thirumalx.exception.BadRequestException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author ThirumalM
 */
@RestController
@RequestMapping("/otp")
public class OtpController {

    Logger logger = LoggerFactory.getLogger(OtpController.class);

    final UserService userService;
    final ContactRepository contactRepository;
    final MfaRepository mfaRepository;

    public OtpController(UserService userService, ContactRepository contactRepository, MfaRepository mfaRepository) {
        this.userService = userService;
        this.contactRepository = contactRepository;
        this.mfaRepository = mfaRepository;
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

    /**
     * Retrieves the available MFA challenge methods during login for the user whose login is pending verification.
     */
    @GetMapping("/login-mfa/methods")
    public ResponseEntity<?> getLoginMfaMethods(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || !Boolean.TRUE.equals(session.getAttribute("MFA_PENDING"))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "No active MFA pending session found"));
        }
        Long loginUserId = (Long) session.getAttribute("MFA_USER_ID");
        logger.debug("Retrieving login MFA methods for user ID {}", loginUserId);
        List<Mfa> mfaList = mfaRepository.findByLoginUserId(loginUserId);
        List<Mfa> activeVerified = mfaList.stream()
                .filter(m -> m.isVerified() && (m.getEndTime() == null || m.getEndTime().isAfter(java.time.OffsetDateTime.now())))
                .collect(Collectors.toList());

        List<Map<String, Object>> resultList = new ArrayList<>();
        for (Mfa mfa : activeVerified) {
            Map<String, Object> map = new HashMap<>();
            map.put("mfaId", mfa.getMfaId());
            map.put("mfaCd", mfa.getMfaCd());
            String mfaName = "Authenticator App";
            String destination = "OTP Authenticator App";
            if (mfa.getMfaCd() == 1) {
                mfaName = "Email";
                Contact contact = contactRepository.findById(mfa.getContactId());
                destination = contact != null ? maskEmail(contact.getLoginId()) : "Registered Email";
            } else if (mfa.getMfaCd() == 2) {
                mfaName = "SMS";
                Contact contact = contactRepository.findById(mfa.getContactId());
                destination = contact != null ? maskPhone(contact.getLoginId()) : "Registered Phone";
            }
            map.put("mfaName", mfaName);
            map.put("destination", destination);
            resultList.add(map);
        }
        return ResponseEntity.ok(resultList);
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        String[] parts = email.split("@");
        String local = parts[0];
        String domain = parts[1];
        if (local.length() <= 2) {
            return local + "***@" + domain;
        }
        return local.charAt(0) + "***" + local.charAt(local.length() - 1) + "@" + domain;
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) return phone;
        return phone.substring(0, 3) + "*****" + phone.substring(phone.length() - 4);
    }

    /**
     * Triggers OTP dispatch to Selected email/SMS config.
     */
    @PostMapping("/login-mfa/send")
    public ResponseEntity<?> sendLoginMfaOtp(@RequestBody Map<String, Long> payload, HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || !Boolean.TRUE.equals(session.getAttribute("MFA_PENDING"))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "No active MFA pending session found"));
        }
        Long mfaId = payload.get("mfaId");
        if (mfaId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "mfaId is required"));
        }
        Mfa mfa = mfaRepository.findById(mfaId);
        if (mfa == null || !mfa.isVerified() || (mfa.getEndTime() != null && mfa.getEndTime().isBefore(java.time.OffsetDateTime.now()))) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid MFA configuration selected"));
        }

        if (mfa.getMfaCd() == 1 || mfa.getMfaCd() == 2) {
            Contact contact = contactRepository.findById(mfa.getContactId());
            if (contact != null) {
                userService.sendLoginMfaOtp(contact);
                return ResponseEntity.ok(Map.of("success", true, "message", "OTP successfully sent"));
            }
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Selected MFA configuration does not support sending OTP"));
    }

    /**
     * Executes OTP or TOTP code verification to complete the login sequence.
     */
    @PostMapping("/login-mfa/verify")
    public ResponseEntity<?> verifyLoginMfa(@RequestBody Map<String, Object> payload, HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || !Boolean.TRUE.equals(session.getAttribute("MFA_PENDING"))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "No active MFA pending session found"));
        }
        Long mfaId = Long.valueOf(payload.get("mfaId").toString());
        String code = payload.get("code").toString();

        Mfa mfa = mfaRepository.findById(mfaId);
        if (mfa == null || !mfa.isVerified() || (mfa.getEndTime() != null && mfa.getEndTime().isBefore(java.time.OffsetDateTime.now()))) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid MFA configuration selected"));
        }

        try {
            if (mfa.getMfaCd() == 4) {
                // TOTP code verification
                if (!io.github.thirumalx.util.TotpUtil.verifyCode(mfa.getSecret(), code)) {
                    throw new BadRequestException("The 6-digit verification code is incorrect");
                }
            } else if (mfa.getMfaCd() == 1 || mfa.getMfaCd() == 2) {
                // Email/SMS OTP code verification
                Contact contact = contactRepository.findById(mfa.getContactId());
                if (contact == null) {
                    throw new BadRequestException("MFA contact details could not be loaded");
                }
                userService.verifyLoginMfaOtp(contact, code);
            } else {
                throw new BadRequestException("Unsupported MFA type");
            }

            // Verification successful, approve session
            session.setAttribute("MFA_PENDING", false);
            String targetUrl = (String) session.getAttribute("MFA_TARGET_URL");
            if (targetUrl == null) {
                targetUrl = "/profile";
            }
            session.removeAttribute("MFA_TARGET_URL");
            
            return ResponseEntity.ok(Map.of("success", true, "redirectUrl", targetUrl));
        } catch (Exception e) {
            logger.error("Login MFA verification failed", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
