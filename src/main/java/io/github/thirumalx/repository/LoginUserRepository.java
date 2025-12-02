package io.github.thirumalx.repository;

import java.util.List;
import java.util.UUID;

import io.github.thirumalx.model.LoginUser;
import io.github.thirumalx.model.Pagination;
/**
 * @author Thirumal
 *
 */
public interface LoginUserRepository {

	/**
	 * Saves the Login user (Resource Owner).
	 *
	 *
	 * @param loginUser the {@link LoginUser}
	 */
	Long save(LoginUser loginUser);

	/**
	 * Returns the login user (Resource Owner) identified by the provided {@code id},
	 * or {@code null} if not found.
	 *
	 * @param id the login user identifier
	 * @return the {@link LoginUser} if found, otherwise {@code null}
	 */
	LoginUser findById(Long id);
	
	/**
	 * Returns the login user (Resource Owner) identified by the provided {@code uuid},
	 * or {@code null} if not found.
	 *
	 * @param uuid the login user identifier
	 * @return the {@link LoginUser} if found, otherwise {@code null}
	 */
	LoginUser findByUuid(UUID uuid);
	
	/**
	 * Update date of birth
	 * @param loginUser
	 * @return
	 */
	int update(LoginUser loginUser);

	/**
	 * List of all login user 
	 * @param pagination
	 * @return list of {@link LoginUser}
	 */
	List<LoginUser> findAll(Pagination pagination);

	long count();
}
