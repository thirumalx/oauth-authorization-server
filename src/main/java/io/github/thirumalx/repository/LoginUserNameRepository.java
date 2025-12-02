/**
 * 
 */
package io.github.thirumalx.repository;

import io.github.thirumalx.model.LoginUserName;

/**
 * @author Thirumal
 *
 */
public interface LoginUserNameRepository {

	Long save(LoginUserName loginUserName);
	
	LoginUserName findById(Long id);
	
	LoginUserName findByLoginUserId(Long id);
	
}
