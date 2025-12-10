/**
 * 
 */
package io.github.thirumalx.controller;

import java.util.UUID;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import io.github.thirumalx.model.ContactVerify;
import io.github.thirumalx.service.UserService;


/**
 * @author ThirumalM
 */
@Controller
@RequestMapping("otp")
public class OtpController {
	
	final UserService userService;
	
	public OtpController(UserService userService) {
		this.userService = userService;
	}

    @GetMapping("/verify-otp")
    public String showOtpPage(@RequestParam UUID loginUuid, Model model) {
    	ContactVerify contactVerify = new ContactVerify();
        model.addAttribute("contactVerify", contactVerify);
        return "verify-otp";
    }

//    @PostMapping("/verify-otp")
//    public String verifyOtp(@ModelAttribute("otpRequest") OtpRequest request,
//                            Model model) {
//
//        boolean valid = otpService.validateOtp(request.getEmail(), request.getOtp());
//
//        if (!valid) {
//            model.addAttribute("error", "Invalid or expired OTP");
//            return "verify-otp";
//        }
//
//        // OTP OK → activate user & redirect to login
//        userService.activateUser(request.getEmail());
//
//        return "redirect:/login?verified=true";
//    }

//    @GetMapping("/resend-otp")
//    public String resendOtp(@RequestParam("email") String email) {
//        otpService.sendOtp(email);
//        return "redirect:/verify-otp?email=" + email + "&resent=true";
//    }
}
