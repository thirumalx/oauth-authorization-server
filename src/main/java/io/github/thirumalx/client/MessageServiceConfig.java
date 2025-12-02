/**
 * 
 */
package io.github.thirumalx.client;

import java.util.concurrent.TimeUnit;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import feign.Logger;
import feign.Request;

/**
 * @author Thirumal
 *
 */
@Configuration
public class MessageServiceConfig {

    @Bean
    Logger.Level feignLoggerLevel() {
        return Logger.Level.BASIC;
    }

    @Bean
    Request.Options notificationOptions() {
		return new Request.Options(6, TimeUnit.MINUTES, 6, TimeUnit.MINUTES, true);
	}
	
}
