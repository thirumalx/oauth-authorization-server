package io.github.thirumalx;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
/**
 * 
 * @author Thirumal
 *
 */
@EnableFeignClients
@SpringBootApplication
public class OauthAuthorizationServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(OauthAuthorizationServerApplication.class, args);
	}

}
