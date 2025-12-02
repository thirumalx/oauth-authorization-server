/**
 * 
 */
package io.github.thirumalx.model;

import java.io.Serializable;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * @author Thirumal
 *
 */
@Getter@Setter
@NoArgsConstructor@AllArgsConstructor
@Builder@ToString
public class Oauth2RegisteredClient implements Serializable {

	private static final long serialVersionUID = 2743515900675642499L;

	private String id;
	private String clientId;
	private LocalDateTime clientIdIssuedAt;
	private String clientSecret;
	private LocalDateTime clientSecretExpiresAt;
	private String clientName;
	private String clientAuthenticationMethods;
	private String authorizationGrantTypes;
	private String redirectUris;
	private String scopes;
	private String clientSettings;
	private String tokenSettings;
	
}
