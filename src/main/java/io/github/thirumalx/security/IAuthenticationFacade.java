/**
 * 
 */
package io.github.thirumalx.security;

import java.util.UUID;
import org.springframework.security.core.Authentication;

/**
 * @author Thirumal
 *
 */
public interface IAuthenticationFacade {

	Authentication getAuthentication();

	Long getLoginId();

	UUID getCurrentUserUuid();

}
