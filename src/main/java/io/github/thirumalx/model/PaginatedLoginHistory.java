/**
 * 
 */
package io.github.thirumalx.model;

import java.util.List;

/**
 * @author Thirumal
 *
 */
public record PaginatedLoginHistory(List<LoginHistory> loginHistories, long count) {

}
