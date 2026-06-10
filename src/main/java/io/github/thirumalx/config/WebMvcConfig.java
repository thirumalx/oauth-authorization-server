package io.github.thirumalx.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration to map static URLs directly to view names without a controller.
 * This ensures that requests to "/profile" resolve to the "index" Thymeleaf
 * template.
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Map /profile directly to the index.html template (which now contains the
        // profile UI)
        registry.addViewController("/profile").setViewName("index");
    }
}
