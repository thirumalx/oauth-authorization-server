package io.github.thirumalx.security;

import java.io.IOException;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * Filter enforcing Multi-Factor Authentication challenge during user login sequence.
 * Blocks access to all protected resources if the session indicates MFA is pending.
 *
 * @author Antigravity
 */
public class MfaEnforcementFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        HttpSession session = httpRequest.getSession(false);
        if (session != null && Boolean.TRUE.equals(session.getAttribute("MFA_PENDING"))) {
            String uri = httpRequest.getRequestURI();
            String contextPath = httpRequest.getContextPath();
            String relativeUri = uri.substring(contextPath.length());

            // Allow access to login, login/mfa routing, otp endpoints, logout, and static resources
            if (relativeUri.equals("/login") || relativeUri.startsWith("/login/mfa") 
                    || relativeUri.startsWith("/otp/") || relativeUri.startsWith("/logout") 
                    || relativeUri.startsWith("/assets/") || relativeUri.equals("/vite.svg")
                    || relativeUri.equals("/favicon.ico") || relativeUri.equals("/index.html")
                    || relativeUri.equals("/error")) {
                chain.doFilter(request, response);
                return;
            }

            // For background AJAX/REST requests, return 401 Unauthorized with custom header
            String accept = httpRequest.getHeader("Accept");
            String requestedWith = httpRequest.getHeader("X-Requested-With");
            if ((accept != null && accept.contains("application/json")) || "XMLHttpRequest".equals(requestedWith)) {
                httpResponse.setContentType("application/json;charset=UTF-8");
                httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                httpResponse.getWriter().write("{\"message\":\"MFA verification required\",\"mfaRequired\":true}");
                return;
            }

            // For browser page navigation requests, redirect to dynamic login MFA challenge route
            httpResponse.sendRedirect(contextPath + "/login/mfa");
            return;
        }

        chain.doFilter(request, response);
    }
}
