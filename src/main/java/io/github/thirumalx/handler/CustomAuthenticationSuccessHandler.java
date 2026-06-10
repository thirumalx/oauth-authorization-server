package io.github.thirumalx.handler;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
import org.springframework.security.web.savedrequest.RequestCache;
import org.springframework.security.web.savedrequest.SavedRequest;
import org.springframework.stereotype.Component;

import io.github.thirumalx.model.LoginUser;
import io.github.thirumalx.model.Mfa;
import io.github.thirumalx.repository.LoginUserRepository;
import io.github.thirumalx.repository.MfaRepository;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Authentication success handler that intercepts successful password logins.
 * If the user has active, verified MFA configurations enabled, they are redirected
 * to the visual MFA challenge route (/login/mfa) and a pending block is placed on the session.
 *
 * @author Antigravity
 */
@Component
public class CustomAuthenticationSuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {

    private RequestCache requestCache = new HttpSessionRequestCache();

    @Autowired
    private LoginUserRepository loginUserRepository;

    @Autowired
    private MfaRepository mfaRepository;

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

        // Determine default target redirect URL based on user role if no saved request exists
        String targetUrl = "/profile";
        boolean isAdmin = false;

        for (GrantedAuthority authority : authentication.getAuthorities()) {
            String role = authority.getAuthority();
            if (role.equals("ROLE_ADMIN") || role.equals("ADMIN")) {
                isAdmin = true;
                break;
            }
        }

        if (isAdmin) {
            targetUrl = "/user";
        }

        String finalDestination = redirectUrl != null ? redirectUrl : targetUrl;

        // Perform Multi-Factor Authentication Check
        try {
            String loginUuidStr = authentication.getName();
            LoginUser loginUser = loginUserRepository.findByUuid(UUID.fromString(loginUuidStr));
            if (loginUser != null) {
                List<Mfa> mfaConfigs = mfaRepository.findByLoginUserId(loginUser.getLoginUserId());
                boolean mfaRequired = mfaConfigs.stream().anyMatch(m -> m.isVerified() && (m.getEndTime() == null || m.getEndTime().isAfter(java.time.OffsetDateTime.now())));
                if (mfaRequired) {
                    logger.debug("MFA is enabled for user " + loginUuidStr + ". Redirecting to challenge page.");
                    request.getSession().setAttribute("MFA_PENDING", true);
                    request.getSession().setAttribute("MFA_USER_ID", loginUser.getLoginUserId());
                    request.getSession().setAttribute("MFA_UUID", loginUuidStr);
                    request.getSession().setAttribute("MFA_TARGET_URL", finalDestination);
                    
                    getRedirectStrategy().sendRedirect(request, response, "/login/mfa");
                    return;
                }
            }
        } catch (Exception e) {
            logger.error("Error executing login MFA check", e);
        }

        logger.debug("Redirecting user directly to final target: " + finalDestination);
        request.getSession().removeAttribute("SPRING_SECURITY_SAVED_REQUEST");
        getRedirectStrategy().sendRedirect(request, response, finalDestination);
    }

    @Override
    public void setRequestCache(RequestCache requestCache) {
        this.requestCache = requestCache;
        super.setRequestCache(requestCache);
    }
}
