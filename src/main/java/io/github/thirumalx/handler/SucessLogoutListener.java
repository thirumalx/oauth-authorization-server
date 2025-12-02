/**
 * 
 */
package io.github.thirumalx.handler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationListener;
import org.springframework.security.authentication.event.LogoutSuccessEvent;
import org.springframework.stereotype.Component;

/**
 * @author Thirumal
 */
@Component
public class SucessLogoutListener implements ApplicationListener<LogoutSuccessEvent>{

	private final Logger logger = LoggerFactory.getLogger(this.getClass());


	@Override
	public void onApplicationEvent(LogoutSuccessEvent event) {
		logger.debug("Logout Success event : {}", event);
		String userName  = event.getAuthentication().getName();
		System.out.println(userName);
	}

}
