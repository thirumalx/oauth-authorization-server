/**
 * 
 */
package io.github.thirumalx.repository;

import java.util.List;

import org.springframework.lang.Nullable;

import io.github.thirumalx.model.Password;

/**
 * @author Thirumal
 *
 */
public interface PasswordRepository {

	Long save(Password password);
	
	@Nullable
	Password findById(Long id);
	
	@Nullable
	Password findByLoginUserId(Long loginUserId);
	
	List<Password> findAllByLoginUserId(Long loginUserId);
	
	List<Password> findAllByLastNRowLoginUserId(Long loginUserId, int lastNRow);
	
	/**
	 * Used for unlocking user
	 * @param loginUserId
	 * @return return true if the password reset date time is greater than last "N" login attempt.
	 */
	boolean isPasswordResetAfterNLoginAttempt(Long loginUserId, int loginAttempt);
}
