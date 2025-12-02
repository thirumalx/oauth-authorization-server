/**
 * 
 */
package io.github.thirumalx.repository;

import java.util.List;

import io.github.thirumalx.model.Token;

/**
 * @author Thirumal
 *
 */
public interface TokenRepository {

	Long save(Token token);
	
	Token findById(Long id);
	
	Token findByContactId(Long contactId);
	
	List<Token> findAllByContactId(Long contactId);
}
