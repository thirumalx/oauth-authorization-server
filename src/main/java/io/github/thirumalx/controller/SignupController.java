/**
 * 
 */
package io.github.thirumalx.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import io.github.thirumalx.model.UserResource;
import io.github.thirumalx.service.UserService;
import jakarta.validation.Valid;

/**
 * @author ThirumalM
 */
@Controller
public class SignupController {

	private final UserService userService;
	
	public SignupController(UserService userService) {
		this.userService = userService;
	}
	
    /** Show signup page */
    @GetMapping("/signup")
    public String showSignupPage(Model model) {
        model.addAttribute("userResource", new UserResource());
        return "signup"; // Thymeleaf template name
    }
    
    @PostMapping("/signup")
    public String doSignup(@ModelAttribute @Valid UserResource userResource,
            BindingResult bindingResult, Model model) {

//        if (userService.existsByEmail(userResource.getEmail())) {
//            bindingResult.rejectValue("email", "error.userResource", "Email already registered");
//        }

        if (bindingResult.hasErrors()) {
            return "signup"; // return to form with errors
        }

        userService.createAccount(userResource);

        return "redirect:/login?signup=success"; //User logs in → OAuth2 flow starts automatically
    }
    
}
