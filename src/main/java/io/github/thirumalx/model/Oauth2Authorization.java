/**
 * 
 */
package io.github.thirumalx.model;

import java.io.Serializable;
import java.time.OffsetDateTime;

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
//@Table("public.oauth2_authorization")
public class Oauth2Authorization implements Serializable {
	
	private static final long serialVersionUID = -82277223078259579L;

//	@Id
//	@Column("id")
	private Long id;
	//@Column("registered_client_id")
	private String registeredClientId;
	//@Column("principal_name")
	private String principalName;
	//@Column("authorization_grant_type")
	private String authorizationGrantType;
	//@Column("attributes")
	private String attributes;
	//@Column("state")
	private String state;
	//@Column("authorization_code_value")
	private String authorizationCodeValue;
	//@Column("authorization_code_issued_at")
	private OffsetDateTime authorizationCodeIssuedAt;
	//@Column("authorization_code_expires_at")
	private OffsetDateTime authorizationCodeExpiresAt;
	//@Column("authorization_code_metadata")
	private String authorizationCodeMetadata;
	//@Column("access_token_value")
	private String accessTokenValue;
	//@Column("access_token_issued_at")
	private OffsetDateTime accessTokenIssuedAt;
	//@Column("access_token_expires_at")
	private OffsetDateTime accessTokenExpiresAt;
	//@Column("access_token_metadata")
	private String accessTokenMetadata;
	//@Column("access_token_type")
	private String accessTokenType;
	//@Column("access_token_scopes")
	private String accessTokenScopes;
	//@Column("oidc_id_token_value")
	private String oidcIdTokenValue;
	//@Column("oidc_id_token_issued_at")
	private OffsetDateTime oidcIdTokenIssuedAt;
	//@Column("oidc_id_token_expires_at")
	private OffsetDateTime oidcIdTokenExpiresAt;
	//@Column("oidc_id_token_metadata")
	private String oidcIdTokenMetadata;
	//@Column("refresh_token_value")
	private String refreshTokenValue;
	//@Column("refresh_token_issued_at")
	private OffsetDateTime refreshTokenIssuedAt;
	//@Column("refresh_token_expires_at")
	private OffsetDateTime refreshTokenExpiresAt;
	//@Column("refresh_token_metadata")
	private String refreshTokenMetadata;
	
}
