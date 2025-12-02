/**
 * 
 */
package io.github.thirumalx.repository;

import java.util.List;

import io.github.thirumalx.model.LoginHistory;

/**
 * @author Thirumal
 *
 */
public interface LoginHistoryRepository {
	
	/**
	 * Saves the Login event.
	 */
	Long save(LoginHistory loginHistory);
	
	/**
	 * Save logout time
	 * @param loginId
	 * @return
	 */
	int saveLogout(Long loginUserId);
	
	/**
	 * List login histories
	 * @param loginId
	 * @return
	 */
	List<LoginHistory> list(Long loginUserId, int limit, int offset);
	
	/**
	 * Is last N login is failed
	 * @param lastNLogin
	 * @return 
	 */
	boolean isLastNLoginFailed(Long loginUserId, int lastNLogin);
	
	/**
	 * Total no.of login made by the give user @param loginUserId
	 * @param loginUserId
	 * @return
	 */
	long count(Long loginUserId);

}
