/**
 * 
 */
package in.thirumal.config;

import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import in.thirumal.exception.ResourceNotFoundException;

/**
 * @author Thirumal
 *
 */
@Configuration
@EnableTransactionManagement
public class PersistenceConfig {

	private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Bean
    @ConfigurationProperties(prefix = "spring.datasource")
    @Primary
    DataSource dataSource() {
		logger.debug("{} : {}", this.getClass().getSimpleName(), Thread.currentThread().getStackTrace()[1].getMethodName());
		try {
			return DataSourceBuilder.create().build();
		} catch (Exception e) {
			throw new ResourceNotFoundException("Data source : " + e.getMessage());
		}
	}

    @Bean
    static PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer() {
		return new PropertySourcesPlaceholderConfigurer();
	}
}
