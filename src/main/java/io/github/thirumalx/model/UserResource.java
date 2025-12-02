package io.github.thirumalx.model;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

import org.springframework.security.core.authority.SimpleGrantedAuthority;

import com.google.i18n.phonenumbers.Phonenumber.PhoneNumber;

import io.github.thirumalx.util.PhoneNumberUtility;
import jakarta.validation.constraints.NotNull;
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
public class UserResource implements Serializable {

	private static final long serialVersionUID = -7020619477594468968L;

	private UUID loginUuid;
	private String firstName;
	private String middleName;
	private String lastName;
	private String email;
	private String phoneNumber;
	private String password;
	private OffsetDateTime dateOfBirth;
	private boolean individual;
	private OffsetDateTime accountCreatedOn;
	//
	private boolean forcePasswordChange;
	// Registered Client details
	@NotNull
	private String registeredClientId;
	private Set<SimpleGrantedAuthority> authorities;
	

	public PhoneNumber getPhoneDetail() {
		return phoneNumber == null ? null : PhoneNumberUtility.getPhoneDetail(phoneNumber);
	}
	
}
