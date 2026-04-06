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

        SavedRequest savedRequest = this.requestCache.getRequest(request, response);

        // If there is a saved request (e.g., from an OAuth2 /authorize flow),
        // let the parent handler redirect the user back to that request URL.
        if (savedRequest != null) {
            super.onAuthenticationSuccess(request, response, authentication);
            return;
        }

        // Check if there was a manually stored redirect_url in session (from ForwardController logic)
        String redirectUrl = (String) request.getSession().getAttribute("SPRING_SECURITY_SAVED_REQUEST");
        if (redirectUrl != null) {
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
