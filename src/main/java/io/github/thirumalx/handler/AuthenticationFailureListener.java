package io.github.thirumalx.handler;

import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.security.authentication.event.AuthenticationFailureBadCredentialsEvent;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import io.github.thirumalx.model.Contact;
import io.github.thirumalx.model.LoginHistory;
import io.github.thirumalx.repository.ContactRepository;
import io.github.thirumalx.repository.LoginHistoryRepository;

/**
 * @author Thirumal
 * Update the number of login attempt made by user/robot
 */
@Component
public class AuthenticationFailureListener implements ApplicationListener<AuthenticationFailureBadCredentialsEvent> {

	private final Logger logger = LoggerFactory.getLogger(this.getClass());
	
	@Autowired
	private ContactRepository contactRepository;
	@Autowired
	private LoginHistoryRepository loginHistoryRepository;

	@Transactional
	@Override
	public void onApplicationEvent(AuthenticationFailureBadCredentialsEvent event) {
		logger.debug("Failed login {}", event);
		String userName  = event.getAuthentication().getName();
		Contact contact = contactRepository.findActiveLoginIdByLoginId(userName);
		if (Objects.isNull(contact)) {
			logger.debug("Not able to find the login id  {} itself .....Ignoring.....", userName);
			return;
		} 
		loginHistoryRepository.save(LoginHistory.builder().loginUserId(contact.getLoginUserId()).successLogin(false).build());
	}

}
