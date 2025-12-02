/**
 * 
 */
package io.github.thirumalx.model;

import java.io.Serializable;
import java.util.Map;
import java.util.Set;

import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;

import lombok.ToString;

/**
 * @author Thirumal
 *
 */
@ToString
public class Client implements Serializable {

	private static final long serialVersionUID = 3980960722483792691L;

	private String clientName;
	private Set<ClientAuthenticationMethod> clientAuthenticationMethods;
	private Set<AuthorizationGrantType> authorizationGrantTypes;
	private Set<String> redirectUris;
	private Set<String> scopes;
	private Map<String, Object> clientSettings;
//	private TokenSettings tokenSettings;
	
	
	/**
	 * @return the clientName
	 */
	public String getClientName() {
		return clientName;
	}
	/**
	 * @param clientName the clientName to set
	 */
	public void setClientName(String clientName) {
		this.clientName = clientName;
	}
	/**
	 * @return the clientAuthenticationMethods
	 */
	public Set<ClientAuthenticationMethod> getClientAuthenticationMethods() {
		return clientAuthenticationMethods;
	}
	/**
	 * @param clientAuthenticationMethods the clientAuthenticationMethods to set
	 */
	public void setClientAuthenticationMethods(Set<ClientAuthenticationMethod> clientAuthenticationMethods) {
		this.clientAuthenticationMethods = clientAuthenticationMethods;
	}
	/**
	 * @return the authorizationGrantTypes
	 */
	public Set<AuthorizationGrantType> getAuthorizationGrantTypes() {
		return authorizationGrantTypes;
	}
	/**
	 * @param authorizationGrantTypes the authorizationGrantTypes to set
	 */
	public void setAuthorizationGrantTypes(Set<AuthorizationGrantType> authorizationGrantTypes) {
		this.authorizationGrantTypes = authorizationGrantTypes;
	}
	/**
	 * @return the redirectUris
	 */
	public Set<String> getRedirectUris() {
		return redirectUris;
	}
	/**
	 * @param redirectUris the redirectUris to set
	 */
	public void setRedirectUris(Set<String> redirectUris) {
		this.redirectUris = redirectUris;
	}
	/**
	 * @return the scopes
	 */
	public Set<String> getScopes() {
		return scopes;
	}
	/**
	 * @param scopes the scopes to set
	 */
	public void setScopes(Set<String> scopes) {
		this.scopes = scopes;
	}

	/**
	 * @return the serialversionuid
	 */
	public static long getSerialversionuid() {
		return serialVersionUID;
	}
	/**
	 * @return the clientSettings
	 */
	public Map<String, Object> getClientSettings() {
		return clientSettings;
	}
	/**
	 * @param clientSettings the clientSettings to set
	 */
	public void setClientSettings(Map<String, Object> clientSettings) {
		this.clientSettings = clientSettings;
	}
}
