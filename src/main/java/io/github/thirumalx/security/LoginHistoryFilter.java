package io.github.thirumalx.security;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

import io.github.thirumalx.handler.AuthenticationSuccessListener;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Filter that runs after the SecurityContextHolder is populated to ensure 
 * that successful logins (including WebAuthn/Passkeys which bypass normal events)
 * are recorded exactly once per session.
 */
@Component
public class LoginHistoryFilter extends OncePerRequestFilter {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    // Simple LRU cache to keep track of processed session IDs to prevent 
    // Spring Session concurrent attribute insert errors. Max size 10000.
    private static final Map<String, Boolean> PROCESSED_SESSIONS = Collections.synchronizedMap(
        new LinkedHashMap<String, Boolean>(1000, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<String, Boolean> eldest) {
                return size() > 10000;
            }
        });

    @Autowired
    private AuthenticationSuccessListener authenticationSuccessListener;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated() && !(authentication instanceof AnonymousAuthenticationToken)) {
            String sessionId = request.getSession().getId();
            
            // Check if we've already recorded the login for this session using our thread-safe memory map
            if (PROCESSED_SESSIONS.putIfAbsent(sessionId, Boolean.TRUE) == null) {
                logger.debug("New authenticated session detected. Recording login history via Filter for user: {}", authentication.getName());
                
                // Manually trigger the listener
                authenticationSuccessListener.onAuthenticationSuccessEvent(new AuthenticationSuccessEvent(authentication));
            }
        }

        filterChain.doFilter(request, response);
    }
}
