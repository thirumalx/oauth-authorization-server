/**
 * 
 */
package io.github.thirumalx.security;

import org.springframework.security.core.Authentication;

/**
 * @author Thirumal
 *
 */
public interface IAuthenticationFacade {
	
	Authentication getAuthentication();
	
	String getLoginId();
	
}
