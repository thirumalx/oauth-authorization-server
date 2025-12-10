package io.github.thirumalx.model;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
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
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class UserResource implements Serializable {

	private static final long serialVersionUID = -7020619477594468968L;

	private UUID loginUuid;
	@NotNull
	private String firstName;
	private String middleName;
	private String lastName;
	private String email;
	private String phoneNumber;
	@NotNull
	private String password;
	@DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
	private OffsetDateTime dateOfBirth;// Or date of Incorporation if user is not an individual
	private boolean individual;
	private OffsetDateTime accountCreatedOn;
	// Account is created by internal system
	private boolean forcePasswordChange;
	// Registered Client details
	//It's not mandatory, if the user creates an account directly from the SAS signup page; 
		//otherwise, it remains mandatory.
	private String registeredClientId;
	private Set<SimpleGrantedAuthority> authorities;

	public PhoneNumber getPhoneDetail() {
		return phoneNumber == null ? null : PhoneNumberUtility.getPhoneDetail(phoneNumber);
	}

	public String getFullName() {
		return firstName +
				(middleName != null ? " " + middleName : "") +
				" " + lastName;
	}

}
