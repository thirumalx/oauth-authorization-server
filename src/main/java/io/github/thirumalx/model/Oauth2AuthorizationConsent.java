/**
 * 
 */
package io.github.thirumalx.model;

import java.io.Serializable;

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
//@Table("public.oauth2_authorization_consent")
public class Oauth2AuthorizationConsent implements Serializable {
	
	private static final long serialVersionUID = 334116105310870588L;
	
//	@Id
//	@Column("registered_client_id")
	private String registeredClientId;
	//@Column("principal_name")
	private String principalName;
	//@Column("authorities")
	private String authorities;

}
