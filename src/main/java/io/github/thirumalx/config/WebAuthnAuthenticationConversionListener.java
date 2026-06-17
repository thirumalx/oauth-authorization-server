package io.github.thirumalx.config;

import org.springframework.context.ApplicationListener;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.stereotype.Component;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

@Component
public class WebAuthnAuthenticationConversionListener implements ApplicationListener<AuthenticationSuccessEvent> {

    @Override
    public void onApplicationEvent(AuthenticationSuccessEvent event) {
        Authentication authentication = event.getAuthentication();
        
        // Convert WebAuthnAuthentication to UsernamePasswordAuthenticationToken 
        // to avoid Jackson serialization errors during the OAuth2 Token Exchange phase
        // since WebAuthnAuthentication is not in the default allowlist.
        if (authentication.getClass().getName().contains("WebAuthnAuthentication")) {
            Authentication newAuth = new UsernamePasswordAuthenticationToken(
                    authentication.getName(),
                    authentication.getCredentials(),
                    authentication.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(newAuth);
        }
    }
}
