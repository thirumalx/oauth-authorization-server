package io.github.thirumalx.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.session.jdbc.config.annotation.web.http.EnableJdbcHttpSession;
/**
 * Configuration class to enable JDBC-backed HTTP sessions with a timeout of 30 minutes.
 * This class is annotated with @Configuration to indicate that it is a source of bean definitions,
 * and @EnableJdbcHttpSession to enable JDBC-based session management.
 * @author thirumal
 * 
 */
@Configuration
@EnableJdbcHttpSession(maxInactiveIntervalInSeconds = 1800) // 30 mins
public class SessionConfig {

}
