package io.github.thirumalx.handler;

import java.util.Objects;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.session.SessionDestroyedEvent;
import org.springframework.stereotype.Component;

import io.github.thirumalx.model.LoginUser;
import io.github.thirumalx.repository.LoginHistoryRepository;
import io.github.thirumalx.repository.LoginUserRepository;

/**
 * Listener that catches container-level session timeouts and destruction events
 * to record corresponding logout timestamps in the database login history.
 *
 * @author Thirumal
 */
@Component
public class SessionDestroyedListener implements ApplicationListener<SessionDestroyedEvent> {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private LoginUserRepository loginUserRepository;

    @Autowired
    private LoginHistoryRepository loginHistoryRepository;

    @Override
    public void onApplicationEvent(SessionDestroyedEvent event) {
        logger.debug("Session destroyed event triggered for session ID: {}", event.getId());
        
        // Process security contexts associated with the expired session
        for (SecurityContext securityContext : event.getSecurityContexts()) {
            if (securityContext.getAuthentication() != null && securityContext.getAuthentication().isAuthenticated()) {
                String userName = securityContext.getAuthentication().getName();
                logger.debug("Registering timeout logout for username: {}", userName);
                
                UUID loginId;
                try {
                    loginId = UUID.fromString(userName);
                } catch (IllegalArgumentException e) {
                    logger.debug("It's client id or non-user login... ignoring.");
                    continue;
                }
                
                LoginUser loginUser = loginUserRepository.findByUuid(loginId);
                if (Objects.isNull(loginUser)) {
                    logger.debug("User details not found in database... ignoring.");
                    continue;
                }

                int status = loginHistoryRepository.saveLogout(loginUser.getLoginUserId());
                if (status == 0) {
                    logger.debug("Timeout logout timestamp was not recorded in DB for user ID {}.", loginUser.getLoginUserId());
                } else {
                    logger.debug("Timeout logout timestamp recorded in DB successfully for user ID {}.", loginUser.getLoginUserId());
                }
            }
        }
    }
}
