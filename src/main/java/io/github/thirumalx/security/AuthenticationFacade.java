/**
 * 
 */
package io.github.thirumalx.security;

import io.github.thirumalx.controller.LoginController;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import io.github.thirumalx.exception.ResourceNotFoundException;
import io.github.thirumalx.exception.UnAuthorizedException;
import io.github.thirumalx.model.LoginUser;
import io.github.thirumalx.repository.dao.LoginUserDao;

/**
 * @author Thirumal
 *         Get the current request user details
 *
 */
@Component
public class AuthenticationFacade implements IAuthenticationFacade {

	private final LoginController loginController;
	private LoginUserDao loginUserDao;

	public AuthenticationFacade(LoginUserDao loginUserDao, LoginController loginController) {
		this.loginUserDao = loginUserDao;
		this.loginController = loginController;
	}

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
	public Long getLoginId() {
		LoginUser loginUser = loginUserDao.findByUuid(getCurrentUserUuid());
		if (loginUser == null) {
			throw new ResourceNotFoundException("Login user is not available in the Database");
		}
		return loginUser.getLoginUserId();
	}

	/**
	 * Get the current authenticated user's UUID
	 */
	@Override
	public UUID getCurrentUserUuid() {
		Authentication authentication = getAuthentication();
		if (authentication == null || !authentication.isAuthenticated()
				|| "anonymousUser".equals(authentication.getName())) {
			throw new UnAuthorizedException("User is not authenticated");
		}
		try {
			return UUID.fromString(authentication.getName());
		} catch (IllegalArgumentException e) {
			throw new UnAuthorizedException("Invalid user identifier format");
		}
	}

}
