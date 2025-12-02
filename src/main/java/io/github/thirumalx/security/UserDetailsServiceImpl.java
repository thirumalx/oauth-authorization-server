/**
 * 
 */
package io.github.thirumalx.security;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import io.github.thirumalx.exception.BadRequestException;
import io.github.thirumalx.exception.UnAuthorizedException;
import io.github.thirumalx.model.Contact;
import io.github.thirumalx.model.LoginUser;
import io.github.thirumalx.model.LoginUserRole;
import io.github.thirumalx.model.Password;
import io.github.thirumalx.repository.ContactRepository;
import io.github.thirumalx.repository.LoginHistoryRepository;
import io.github.thirumalx.repository.LoginUserRepository;
import io.github.thirumalx.repository.LoginUserRoleRepository;
import io.github.thirumalx.repository.PasswordRepository;

/**
 * @author Thirumal
 *
 */
@Service("userDetailsService")
public class UserDetailsServiceImpl implements UserDetailsService {

	private final Logger logger = LoggerFactory.getLogger(this.getClass());
		
	@Autowired
	private LoginUserRepository loginUserRepository;
	@Autowired
	private LoginHistoryRepository loginHistoryRepository;
	@Autowired
	private LoginUserRoleRepository loginUserRoleRepository;
	@Autowired
	private ContactRepository contactRepository;
	@Autowired
	private PasswordRepository passwordRepository;
	
	
	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		logger.debug("The user {} accessing at {}", username, LocalDateTime.now());
		Contact contact = contactRepository.findActiveLoginIdByLoginId(username);
		logger.debug("Login {}", contact);
		if (contact == null) {
			String errorMessage = "The requested login id " + username + " is not available in the system";
			logger.debug(errorMessage);
			throw new UnAuthorizedException(errorMessage);
		} else if (contact.getVerifiedOn() == null) {
			String errorMessage = "Your account: " + username + " is not verified...";
			logger.debug(errorMessage);
			//throw new UnAuthorizedException(errorMessage); // Uncomment this line to throw exception on unverified login 
		}
		// Login User
		LoginUser loginUser = loginUserRepository.findById(contact.getLoginUserId());
		logger.debug("The login user is {}", loginUser);
		if (loginUser == null || loginUser.getLoginUuid() == null) {
			throw new UnAuthorizedException("Login id is not available");
		}
		// Password
		Password password = passwordRepository.findByLoginUserId(contact.getLoginUserId());
		if (password == null) {
			throw new UnAuthorizedException("Password is not set/found.");
		} else if (password.isForcePasswordChange()) {
			throw new BadRequestException("Need to reset password");
		}
		long duration = ChronoUnit.DAYS.between(password.getRowCreatedOn().toLocalDate(), LocalDate.now());
		//ROLES
		List<LoginUserRole> loginUserRoles = loginUserRoleRepository.findAllByLoginUserId(loginUser.getLoginUserId());
		List<SimpleGrantedAuthority> authorities = new ArrayList<>();	     
	    for (LoginUserRole loginUserRole : loginUserRoles) {
	    	// Prefix roles with "ROLE_" to match Spring Security's expectations for hasRole()
	        //authorities.add(new SimpleGrantedAuthority("ROLE_" + loginUserRole.getRole()))
	    	 authorities.add(new SimpleGrantedAuthority(loginUserRole.getRole()));
	    }	  
	    boolean accountLocked = loginHistoryRepository.isLastNLoginFailed(loginUser.getLoginUserId(), 5) &&
	    		!passwordRepository.isPasswordResetAfterNLoginAttempt(loginUser.getLoginUserId(), 5);
		return User.withUsername(loginUser.getLoginUuid().toString()).password(password.getSecretKey())
				.authorities(authorities)
				.accountLocked(accountLocked)
				.credentialsExpired(duration > 60)
				.build();
	}

}
