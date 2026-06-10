/**
 * 
 */
package io.github.thirumalx.handler;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.security.authentication.event.LogoutSuccessEvent;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.datatype.jsr310.ser.OffsetTimeSerializer;

import io.github.thirumalx.model.LoginHistory;
import io.github.thirumalx.model.LoginUser;
import io.github.thirumalx.repository.LoginHistoryRepository;
import io.github.thirumalx.repository.LoginUserRepository;

/**
 * @author Thirumal
 */
@Component
public class SucessLogoutListener implements ApplicationListener<LogoutSuccessEvent> {

	private final Logger logger = LoggerFactory.getLogger(this.getClass());

	@Autowired
	private LoginUserRepository loginUserRepository;
	@Autowired
	private LoginHistoryRepository loginHistoryRepository;

	@Override
	public void onApplicationEvent(LogoutSuccessEvent event) {
		logger.debug("Logout Success event : {}", event);
		String userName = event.getAuthentication().getName();
		logger.debug("User name : {} is logging out!!", userName);
		UUID loginId;
		try {
			loginId = UUID.fromString(userName);
		} catch (IllegalArgumentException e) {
			logger.debug("It's client id.....Ignoring.....");
			return;
		}
		LoginUser loginUser = loginUserRepository.findByUuid(loginId);
		if (Objects.isNull(loginUser)) {
			logger.debug("It's client id login.....Ignoring.....");
			return;
		}

		int status = loginHistoryRepository.saveLogout(loginUser.getLoginUserId());
		if (status == 0) {
			logger.debug("User name : {} is not recored logged out in DB!!", userName);
			return;
		}
		logger.debug("User name : {} is logged out successfully!!", userName);
	}

}
