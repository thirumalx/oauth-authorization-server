package io.github.thirumalx.filter;

import java.io.IOException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Filter to forward all browser navigation/page requests (GET requests expecting HTML)
 * to /index.html for SPA frontend routing.
 * This prevents conflicts with REST APIs (which expect JSON and send Accept: application/json or * / *).
 */
@Component
public class SpaRoutingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        String accept = request.getHeader("Accept");

        // Forward to index.html if:
        // 1. It is a GET request
        // 2. The request accepts HTML (Accept header contains text/html)
        // 3. The request is not for a static file (does not contain a dot)
        // 4. The path matches our React frontend routes
        if ("GET".equalsIgnoreCase(request.getMethod())
                && accept != null && accept.contains("text/html")
                && !path.contains(".")
                && (path.equals("/") || path.startsWith("/login") || path.startsWith("/signup")
                    || path.startsWith("/forgot-password") || path.startsWith("/verify-otp")
                    || path.startsWith("/user") || path.startsWith("/profile")
                    || path.startsWith("/consented-apps") || path.startsWith("/oauth2/consent"))) {
            
            logger.debug("SPA Routing Filter: forwarding GET " + path + " to /index.html");
            request.getRequestDispatcher("/index.html").forward(request, response);
            return;
        }

        filterChain.doFilter(request, response);
    }
}
