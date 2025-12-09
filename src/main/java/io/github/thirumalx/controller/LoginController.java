/**
 * 
 */
package io.github.thirumalx.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * @author Thirumal
 *
 */
@Controller
public class LoginController {

    /**
     * Display custom login page
     * Spring Security will handle the POST automatically
     */
    @GetMapping("/login")
    public String login(
            @RequestParam(value = "error", required = false) String error,
            @RequestParam(value = "logout", required = false) String logout,
            @RequestParam(value = "signup", required = false) String signup,
            Model model) {
        
        if (error != null) {
            model.addAttribute("error", true);
        }
        if (logout != null) {
            model.addAttribute("logout", true);
        }
        if (signup != null) {
            model.addAttribute("signup", true);
        }
        
        return "login";
    }
}
