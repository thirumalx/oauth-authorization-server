/**
 * 
 */
package io.github.thirumalx.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * @author Thirumal
 * Get the current request user details
 *
 */
@Component
public class AuthenticationFacade implements IAuthenticationFacade {

	/** 
	 * Get the current requested user authentication details
	 */
	@Override
	public Authentication getAuthentication() {
		return SecurityContextHolder.getContext().getAuthentication();
	}

	/** 
	 * Get the current requested user login id (UUID)
	 */
	@Override
	public String getLoginId() {
		return getAuthentication() == null ? null : getAuthentication().getName();
	}

}
