/**
 * 
 */
package in.thirumal.security.captcha;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/**
 * @author Thirumal
 */
@Configuration
public class RestTemplateConfig {

	/*
	 * Bean is required for re-captcha
	 */
	@Bean
	RestTemplate restTemplate() {
		return new RestTemplate(httpRequestFactory());
	}

	private ClientHttpRequestFactory httpRequestFactory() {
		HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory();
		factory.setConnectionRequestTimeout(99999);
		return factory;
	}

}
