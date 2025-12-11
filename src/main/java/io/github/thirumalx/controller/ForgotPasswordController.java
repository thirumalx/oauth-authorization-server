/**
 * 
 */
package io.github.thirumalx.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import io.github.thirumalx.model.ResetPassword;
import io.github.thirumalx.service.UserService;

/**
 * @author ThirumalM
 */
@Controller
public class ForgotPasswordController {

    Logger logger = LoggerFactory.getLogger(ForgotPasswordController.class);

    static final String OTP_FORM 			 = "showOtpForm";
    static final String FORGOT_PASSWORD_PAGE = "forgot-password";
    
    final UserService userService;

    public ForgotPasswordController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Show forgot password page
     * 
     * @param loginId - optional, if provided shows OTP form
     * @param model   - Spring MVC model
     * @return forgot-password template
     */
    @GetMapping("/forgot-password")
    public String showForgotPasswordPage(@RequestParam(required = false) String loginId, Model model) {
        logger.debug("Showing forgot password page for loginId: {}", loginId);
        ResetPassword resetPassword = new ResetPassword();
        boolean showOtpForm = false; // OTP form or user login details form
        if (loginId != null && !loginId.isEmpty()) {
            resetPassword.setLoginId(loginId);
            showOtpForm = true;
        }
        model.addAttribute(OTP_FORM, showOtpForm);
        model.addAttribute("resetPassword", resetPassword);
        return FORGOT_PASSWORD_PAGE;
    }

    /**
     * Request OTP for password reset - sends password along with request for
     * validation
     * 
     * @param loginId  - email or phone number
     * @param password - new password to validate against last 3 passwords
     * @param model    - Spring MVC model
     * @return forgot-password page with OTP form or error
     */
    @PostMapping("/forgot-password/request-otp")
    public String requestPasswordResetOtp(@RequestParam String loginId,
            @RequestParam String password,
            Model model) {
        logger.debug("Requesting password reset OTP for: {}", loginId);

        try {
            // Call service to send OTP with password for validation
            Map<String, Object> payload = Map.of("loginId", loginId, "password", password);
            userService.requestOtp(payload, "reset-password");

            // Show OTP form on same page
            ResetPassword resetPassword = new ResetPassword();
            resetPassword.setLoginId(loginId);
            resetPassword.setPassword(password);

            model.addAttribute("resetPassword", resetPassword);
            model.addAttribute(OTP_FORM, true);
            model.addAttribute("success", "Verification code sent to " + loginId);

            return FORGOT_PASSWORD_PAGE;

        } catch (Exception e) {
            logger.error("Failed to send OTP for: {}", loginId, e);

            ResetPassword resetPassword = new ResetPassword();
            resetPassword.setLoginId(loginId);

            model.addAttribute("resetPassword", resetPassword);
            model.addAttribute(OTP_FORM, false);
            model.addAttribute("error", e.getMessage());

            return FORGOT_PASSWORD_PAGE;
        }
    }

    /**
     * Resend OTP for password reset
     * 
     * @param loginId  - email or phone number
     * @param password - new password
     * @param model    - Spring MVC model
     * @return forgot-password page with OTP form or error
     */
    @PostMapping("/forgot-password/resend-otp")
    public String resendPasswordResetOtp(@RequestParam String loginId,
            @RequestParam String password,
            Model model) {
        logger.debug("Resending password reset OTP for: {}", loginId);

        // Reuse the same logic as request OTP
        return requestPasswordResetOtp(loginId, password, model);
    }

    /**
     * Reset password with OTP verification
     * 
     * @param resetPassword - contains loginId, otp, and new password
     * @param model         - Spring MVC model
     * @return redirect to login page or back with error
     */
    @PostMapping("/forgot-password/reset")
    public String resetPassword(@ModelAttribute ResetPassword resetPassword, Model model) {
        logger.debug("Resetting password for: {}", resetPassword.getLoginId());

        try {
            // Call service to reset password
            userService.resetPassword(resetPassword);

            // Redirect to login with success message
            return "redirect:/login?passwordReset=true";

        } catch (Exception e) {
            logger.error("Failed to reset password for: {}", resetPassword.getLoginId(), e);

            model.addAttribute("resetPassword", resetPassword);
            model.addAttribute(OTP_FORM, true);
            model.addAttribute("error", e.getMessage());

            return FORGOT_PASSWORD_PAGE;
        }
    }
}
