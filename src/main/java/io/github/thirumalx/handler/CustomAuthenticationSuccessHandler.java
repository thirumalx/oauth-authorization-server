package io.github.thirumalx.handler;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
import org.springframework.security.web.savedrequest.RequestCache;
import org.springframework.security.web.savedrequest.SavedRequest;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class CustomAuthenticationSuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {

    private RequestCache requestCache = new HttpSessionRequestCache();

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws ServletException, IOException {

        Object savedRequestObj = request.getSession().getAttribute("SPRING_SECURITY_SAVED_REQUEST");
        String redirectUrl = null;

        if (savedRequestObj instanceof SavedRequest) {
            redirectUrl = ((SavedRequest) savedRequestObj).getRedirectUrl();
        } else if (savedRequestObj instanceof String) {
            redirectUrl = (String) savedRequestObj;
        }

        if (redirectUrl != null) {
            logger.debug("Checking saved request redirect URL: " + redirectUrl);
            if (redirectUrl.contains("/login-histories") || redirectUrl.contains("/phone-number") 
                    || redirectUrl.contains("/email") || redirectUrl.contains("/allowed-ip") 
                    || redirectUrl.contains("/mfa") || redirectUrl.contains("/personal-info")
                    || redirectUrl.contains("/client") || redirectUrl.contains("/userinfo")
                    || redirectUrl.contains("/address")) {
                logger.debug("Clearing REST API saved request from session: " + redirectUrl);
                request.getSession().removeAttribute("SPRING_SECURITY_SAVED_REQUEST");
                redirectUrl = null;
            }
        }

        if (redirectUrl != null) {
            logger.debug("Redirecting to saved request: " + redirectUrl);
            request.getSession().removeAttribute("SPRING_SECURITY_SAVED_REQUEST");
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
            return;
        }

        // If it's a direct login (no saved request), redirect based on role
        boolean isAdmin = false;

        for (GrantedAuthority authority : authentication.getAuthorities()) {
            String role = authority.getAuthority();
            if (role.equals("ROLE_ADMIN") || role.equals("ADMIN")) {
                isAdmin = true;
                break;
            }
        }

        if (isAdmin) {
            getRedirectStrategy().sendRedirect(request, response, "/user");
        } else {
            getRedirectStrategy().sendRedirect(request, response, "/profile");
        }
    }

    @Override
    public void setRequestCache(RequestCache requestCache) {
        this.requestCache = requestCache;
        super.setRequestCache(requestCache);
    }
}
