/**
 * 
 */
package io.github.thirumalx.handler;

import java.util.Objects;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2AuthorizationCodeRequestAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import io.github.thirumalx.model.LoginHistory;
import io.github.thirumalx.model.LoginUser;
import io.github.thirumalx.repository.LoginHistoryRepository;
import io.github.thirumalx.repository.LoginUserRepository;

/**
 * @author Thirumal
 * Update the number of login attempt made by user to Zero 0
 */
@Component
public class AuthenticationSuccessListener implements ApplicationListener<AuthenticationSuccessEvent> {

	private final Logger logger = LoggerFactory.getLogger(this.getClass());
	
	@Autowired
	private LoginUserRepository loginUserRepository;
	@Autowired
	private LoginHistoryRepository loginHistoryRepository;
	
	@Override@Transactional
	public void onApplicationEvent(AuthenticationSuccessEvent event) {  
		logger.debug("Login Success event : {}", event);
		String userName  = event.getAuthentication().getName();
		if (event.getSource() instanceof OAuth2AuthorizationCodeRequestAuthenticationToken) {
			logger.debug("Authorization code request....after success login.....Ignoring....");
			return;
		}
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
		loginHistoryRepository.save(LoginHistory.builder().loginUserId(loginUser.getLoginUserId()).successLogin(true).build());
	}

	
}
