/**
 * 
 */
package io.github.thirumalx.repository;

import java.util.List;

import io.github.thirumalx.model.GenericCd;

/**
 * @author Thirumal
 *
 */
public interface GenericCdRepository {

	List<GenericCd> list(String tableName, Long localeCd);
}
