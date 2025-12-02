/**
 * 
 */
package io.github.thirumalx.service;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.stereotype.Service;

import io.github.thirumalx.exception.ResourceNotFoundException;
import io.github.thirumalx.model.Client;

/**
 * @author Thirumal
 *
 */
@Service
public class RegisterClientService {

	Logger logger = LoggerFactory.getLogger(RegisterClientService.class);

	@Autowired
	JdbcTemplate jdbcTemplate;
	
	@Autowired
	PasswordEncoder passwordEncoder;
	
	@Autowired
	RegisteredClientRepository registeredClientRepository;
	
	public RegisteredClient register(Client client) {
		logger.debug("Registering the client {}", client);
		String clientPrimaryKey = UUID.randomUUID().toString();	
		//Client
		RegisteredClient registeredClient =
				RegisteredClient
				.withId(clientPrimaryKey)
				.clientId(UUID.randomUUID().toString())
		       // .clientSecret("{noop}"+ UUID.randomUUID().toString())
				.clientSecret(passwordEncoder.encode("Thirumal"))
		        .clientAuthenticationMethods(t -> t.addAll(client.getClientAuthenticationMethods()))
		      //   . clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
		        .authorizationGrantTypes(t -> t.addAll(client.getAuthorizationGrantTypes()))
		       //   .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
		        //  .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
		          //.authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
		        .redirectUris(r -> r.addAll(client.getRedirectUris())) 
		      //  .redirectUri("http://127.0.0.1:8000/login/oauth2/code/users-client-oidc")
		         // .redirectUri("http://127.0.0.1:8000/authorized")
		        .scopes(s -> s.addAll(client.getScopes()))
		          //.scope(OidcScopes.OPENID)
		          //.scope(OidcScopes.PROFILE)
		          //.scope("read")
		         //  .clientSettings(ClientSettings.builder().requireAuthorizationConsent(true).build())
		        .clientSettings(ClientSettings.withSettings(client.getClientSettings()).build())
		          //.tokenSettings(tokenSettings()) 
				.build();	
		registeredClientRepository.save(registeredClient);
		return get(clientPrimaryKey);
	}
	
	public RegisteredClient get(String id) {
		logger.debug("Finding registered client.... {}", id);
		RegisteredClient registeredClient = registeredClientRepository.findById(id);
		logger.debug("Client detail : {}", registeredClient);
		if (registeredClient == null) {
			throw new ResourceNotFoundException("The requested client is not found");
		}
		return registeredClient;
	}

}
