/**
 * 
 */
package io.github.thirumalx.repository;

import java.util.List;

import io.github.thirumalx.model.Mfa;

/**
 * @author Thirumal
 *
 */
public interface MfaRepository {

	Long save(Mfa mfa); //Enable
	
	Mfa findById(Long id);
	
	List<Mfa> findByLoginUserId(Long loginUserId);
	
	int disable(Long loginUserId);
}
