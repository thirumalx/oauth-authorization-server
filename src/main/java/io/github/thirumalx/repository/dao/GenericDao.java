/**
 * 
 */
package io.github.thirumalx.repository.dao;

import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;

import io.github.thirumalx.exception.BadRequestException;
import io.github.thirumalx.exception.ResourceNotFoundException;

/**
 * @author Thirumal
 *
 */
public abstract class GenericDao {

	protected final Logger logger = LoggerFactory.getLogger(this.getClass());
    
    @Autowired
    protected JdbcTemplate jdbcTemplate;
    @Autowired
    protected Environment environment;
    
    protected String messageOf = "MessageOf";
    protected String rowCreatedOn = "row_created_on";
 
    //Error Message    
    protected String primaryKeyErr = "Not able to generate PK";
    
    /**
     * Get SQL query from the 
     * src/main/resources/sql.properties file
     * @param key
     * @return SQL query
     */
    protected String getSql(String key) {
        String sql = environment.getProperty(key);
        if (sql != null) {
            return sql;
        }
        String errorMessage = "The SQL for the requested key "+ key +  " is not found"; 
        logger.debug(errorMessage);
        throw new ResourceNotFoundException("SQL is not found!!");
    }
    
    protected String setInvalues(String query, String replaceString, Set<String> inValues) {
		if (inValues == null || inValues.isEmpty()) {
			throw new BadRequestException(" List cannot be empty");
		}
		return query.replace(replaceString, "'" + inValues.stream().map(Object::toString).collect(Collectors.joining("','")) + "'");
	}
}
