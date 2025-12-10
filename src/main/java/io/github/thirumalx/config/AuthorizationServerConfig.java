/**
 * 
 */
package io.github.thirumalx.config;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Duration;
import java.util.Arrays;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.client.JdbcRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * @author Thirumal
 *
 */
@EnableWebSecurity
@Configuration(proxyBeanMethods = false)
// @Import(OAuth2AuthorizationServerConfiguration.class)
public class AuthorizationServerConfig {

	/**
	 * Client ID – Spring will use it to identify which client is trying to access
	 * the resource
	 * Client secret code – a secret known to the client and server that provides
	 * trust between the two
	 * Authentication method – in our case, we'll use basic authentication, which is
	 * just a username and password
	 * Authorization grant type – we want to allow the client to generate both an
	 * authorization code and a refresh token
	 * Redirect URI – the client will use it in a redirect-based flow
	 * Scope – this parameter defines authorizations that the client may have.
	 * In our case, we'll have the required OidcScopes.OPENID and our custom one,
	 * articles. read
	 * 
	 * @return
	 */
	@Bean
	RegisteredClientRepository registeredClientRepository(JdbcTemplate jdbcTemplate) {
		return new JdbcRegisteredClientRepository(jdbcTemplate);
	}

	@Bean
	OAuth2AuthorizationService authorizationService(JdbcTemplate jdbcTemplate,
			RegisteredClientRepository registeredClientRepository) {
		return new JdbcOAuth2AuthorizationService(jdbcTemplate, registeredClientRepository);
	}

	@Bean
	OAuth2AuthorizationConsentService authorizationConsentService(JdbcTemplate jdbcTemplate,
			RegisteredClientRepository registeredClientRepository) {
		return new JdbcOAuth2AuthorizationConsentService(jdbcTemplate, registeredClientRepository);
	}

	/**
	 * This filter chain is for the application
	 * 
	 * @param http
	 * @return
	 * @throws Exception
	 */
	@Bean
	@Order(2)
	SecurityFilterChain applicationSecurityFilterChain(HttpSecurity http) throws Exception {
		http.authorizeHttpRequests(authorize -> authorize
				// Allow public access to login, signup, and static resources
				.requestMatchers("/login", "/signup", "/style/**", "/error", "/forgot-password/**",
						"/client/**", "/swagger-ui/**", "/v3/api-docs/**", "/vendor/**",
						"/favicon.ico", "/actuator/**", "/webjars/**", "/verify-otp/**")
				.permitAll()
				// Restrict /user endpoint to users with ADMIN role
				.requestMatchers("/user/**").hasAuthority("ADMIN")
				.anyRequest().authenticated())
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				// Form login handles the redirect to the login page from the
				// authorization server filter chain
				.formLogin(form -> form
						.loginPage("/login") // Custom login page
						.permitAll())
				.logout(logout -> logout
						.logoutSuccessUrl("/login?logout")
						.permitAll())
				.requestCache(requestCache -> {
					HttpSessionRequestCache cache = new HttpSessionRequestCache() {
						@Override
						public void saveRequest(HttpServletRequest request, HttpServletResponse response) {
							if (request.getRequestURI().equals("/error")) {
								return; // skip saving /error
							}
							String redirectUrl = request.getParameter("redirect_url");
							if (redirectUrl != null) {
								request.getSession().setAttribute("SPRING_SECURITY_SAVED_REQUEST", redirectUrl);
							} else {
								super.saveRequest(request, response);
							}
						}
					};
					requestCache.requestCache(cache);
				})
				.exceptionHandling(exceptions -> exceptions
						.accessDeniedHandler((request, response, accessDeniedException) -> {
							// Custom access denied handler for /user endpoint
							if (request.getRequestURI().startsWith("/user")) {
								response.sendError(HttpServletResponse.SC_FORBIDDEN,
										"Access denied. Admin role required to access this resource.");
							} else {
								response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access denied.");
							}
						}));

		return http.build();
	}

	/**
	 * This filter chain is for the authorization server
	 * 
	 * @param http
	 * @return
	 * @throws Exception
	 */
	@Bean
	@Order(1)
	SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http)
			throws Exception {
		OAuth2AuthorizationServerConfigurer authorizationServerConfigurer = OAuth2AuthorizationServerConfigurer
				.authorizationServer();

		http
				.securityMatcher(authorizationServerConfigurer.getEndpointsMatcher())
				.with(authorizationServerConfigurer, authorizationServer -> authorizationServer
						.oidc(Customizer.withDefaults()) // Enable OpenID Connect 1.0
				)
				.authorizeHttpRequests(authorize -> authorize.anyRequest().authenticated())
				// Redirect to the login page when not authenticated from the
				// authorization endpoint
				.exceptionHandling(exceptions -> exceptions
						.defaultAuthenticationEntryPointFor(
								new LoginUrlAuthenticationEntryPoint("/login"),
								new MediaTypeRequestMatcher(MediaType.TEXT_HTML)))
				.cors(Customizer.withDefaults());
		return http.build();
	}

	@Bean
	JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
		return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource);
	}

	@Bean
	JWKSource<SecurityContext> jwkSource() {
		RSAKey rsaKey = generateRsa();
		JWKSet jwkSet = new JWKSet(rsaKey);
		return new ImmutableJWKSet<>(jwkSet);
	}

	private static RSAKey generateRsa() {
		KeyPair keyPair = generateRsaKey();
		RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
		RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();
		return new RSAKey.Builder(publicKey).privateKey(privateKey).keyID(UUID.randomUUID().toString()).build();
	}

	private static KeyPair generateRsaKey() {
		KeyPair keyPair;
		try {
			KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
			keyPairGenerator.initialize(2048);
			keyPair = keyPairGenerator.generateKeyPair();
		} catch (Exception ex) {
			throw new IllegalStateException(ex);
		}
		return keyPair;
	}

	@Bean
	TokenSettings tokenSettings() {
		//@formatter:off
      return TokenSettings.builder()
          .accessTokenTimeToLive(Duration.ofMinutes(30L))
          .build();
      // @formatter:on
	}

	@Bean
	AuthorizationServerSettings authorizationServerSettings() {
		return AuthorizationServerSettings.builder().build();
	}

	@Bean
	OAuth2TokenCustomizer<JwtEncodingContext> jwtCustomizer(CustomClaims claims) {
		return context -> {
			if (context.getTokenType() == OAuth2TokenType.ACCESS_TOKEN) {
				Authentication principal = context.getPrincipal();
				Set<String> authorities = principal.getAuthorities().stream()
						.map(GrantedAuthority::getAuthority)
						.collect(Collectors.toSet());
				context.getClaims().claims(c -> c.put("creator", "Thirumal"));
				context.getClaims().claims(c -> c.putAll(claims.getClaims(principal)));
				context.getClaims().claim("roles", authorities);
			}
		};
	}

	@Bean
	CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration corsConfiguration = new CorsConfiguration();
		corsConfiguration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
		corsConfiguration.setAllowedMethods(Arrays.asList("GET", "POST", "OPTIONS"));
		corsConfiguration.setAllowedHeaders(Arrays.asList("*"));
		corsConfiguration.setAllowCredentials(true); // important for cookies/session
		corsConfiguration.setMaxAge(3600L); // 1 hour
		UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();
		urlBasedCorsConfigurationSource.registerCorsConfiguration("/**", corsConfiguration);
		return urlBasedCorsConfigurationSource;
	}

}
