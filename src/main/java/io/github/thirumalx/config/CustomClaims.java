/**
 * 
 */
package io.github.thirumalx.config;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import io.github.thirumalx.model.Contact;
import io.github.thirumalx.model.LoginUser;
import io.github.thirumalx.model.LoginUserName;
import io.github.thirumalx.repository.ContactRepository;
import io.github.thirumalx.repository.LoginUserNameRepository;
import io.github.thirumalx.repository.LoginUserRepository;

/**
 * @author Thirumal
 *
 */
@Component
public class CustomClaims {

	Logger logger = LoggerFactory.getLogger(CustomClaims.class);
	
	@Autowired
	LoginUserRepository loginUserRepository;
	@Autowired
	LoginUserNameRepository loginUserNameRepository;
	@Autowired
	ContactRepository contactRepository;

	public Map<String, Object> getClaims(Authentication principal) {
		logger.debug("Seting user details in claim  for the user {}", principal.getName());
		Map<String, Object> claims = new HashMap<>();
		LoginUser loginUser = loginUserRepository.findByUuid(UUID.fromString(principal.getName()));
		if(Objects.isNull(loginUser)) {
			return Map.of();
		}
		claims.put("individual", loginUser.isIndividual());
		claims.put("dateOfBirth", convertToString(loginUser.getDateOfBirth()));
		LoginUserName loginUserName = loginUserNameRepository.findByLoginUserId(loginUser.getLoginUserId());
		claims.put("firstName", loginUserName.getFirstName());
		claims.put("middleName", loginUserName.getMiddleName());
		claims.put("lastName", loginUserName.getLastName());
		List<Contact> contacts = contactRepository.findAllByLoginUserId(loginUser.getLoginUserId());
		for (var contact : contacts) {
			if (Contact.EMAIL.equals(contact.getContactCd())) {
				claims.put("email", contact.getLoginId());
				claims.put("emailVerifiedOn", convertToString(contact.getVerifiedOn()));
			} else if (Contact.PHONE_NUMBER.equals(contact.getContactCd())) {
				claims.put("phoneNumber", contact.getLoginId());
				claims.put("phoneNumberVerifiedOn", convertToString(contact.getVerifiedOn()));
			}
		}
		return claims;		
	}

	private String convertToString(Object obj) {
		return obj == null ? null : obj.toString();
	}
	
}
