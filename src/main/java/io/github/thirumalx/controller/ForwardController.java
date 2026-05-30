package io.github.thirumalx.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller to forward all non-API/non-static requests to index.html for SPA
 * routing
 */
@Controller
public class ForwardController {

    @GetMapping(value = {
            "/",
            "/login",
            "/signup",
            "/forgot-password",
            "/user/**",
            "/profile/**",
            "/consented-apps",
            "/oauth2/consent",
            "/{path:[^\\.]*}"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
