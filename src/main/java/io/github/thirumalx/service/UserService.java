package io.github.thirumalx.service;

import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsent;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import io.github.thirumalx.client.MessageServiceClient;
import io.github.thirumalx.exception.BadRequestException;
import io.github.thirumalx.exception.NotImplementedException;
import io.github.thirumalx.exception.ResourceNotFoundException;
import io.github.thirumalx.model.Contact;
import io.github.thirumalx.model.ContactVerify;
import io.github.thirumalx.model.Email;
import io.github.thirumalx.model.GenericCd;
import io.github.thirumalx.model.Login;
import io.github.thirumalx.model.LoginUser;
import io.github.thirumalx.model.LoginUserName;
import io.github.thirumalx.model.LoginUserRole;
import io.github.thirumalx.model.Message;
import io.github.thirumalx.model.PaginatedLoginHistory;
import io.github.thirumalx.model.PaginatedUser;
import io.github.thirumalx.model.Pagination;
import io.github.thirumalx.model.Password;
import io.github.thirumalx.model.ResetPassword;
import io.github.thirumalx.model.Token;
import io.github.thirumalx.model.UserResource;
import io.github.thirumalx.repository.ContactRepository;
import io.github.thirumalx.repository.GenericCdRepository;
import io.github.thirumalx.repository.LoginHistoryRepository;
import io.github.thirumalx.repository.LoginUserNameRepository;
import io.github.thirumalx.repository.LoginUserRepository;
import io.github.thirumalx.repository.LoginUserRoleRepository;
import io.github.thirumalx.repository.PasswordRepository;
import io.github.thirumalx.repository.TokenRepository;
import io.github.thirumalx.util.RegexValidation;
import jakarta.validation.Valid;

/**
 * @author Thirumal
 *
 */
@Service
public class UserService {

	Logger logger = LoggerFactory.getLogger(UserService.class);
	//
	//
	@Value("${notification.email.sender}")
	String emailSender;
	@Value("${notification.sms.sender}")
	String smsSender;
	@Value("${notification.enabled:true}")
	private boolean otpEnabled;

	@Autowired
	private OAuth2AuthorizationConsentService oAuth2AuthorizationConsentService;
	//
	@Autowired
	private GenericCdRepository genericCdRepository;
	@Autowired
	private ContactRepository contactRepository;
	@Autowired
	private LoginUserRepository loginUserRepository;
	@Autowired
	private LoginUserNameRepository loginUserNameRepository;
	@Autowired
	private LoginHistoryRepository loginHistoryRepository;
	@Autowired
	private PasswordRepository passwordRepository;
	@Autowired
	private TokenRepository tokenRepository;
	@Autowired
	private MessageServiceClient messageServiceClient;
	@Autowired
	private LoginUserRoleRepository loginUserRoleRepository;
	@Autowired
	PasswordEncoder passwordEncoder;

	//
	/**
	 * Create new account for the user
	 * 
	 * @param userResource
	 * @return
	 */
	@Transactional
	public UserResource createAccount(UserResource userResource) {
		logger.debug("Creating new user.... {}", userResource);
		// Validation
		List<GenericCd> genericCds = genericCdRepository.list(GenericCd.CONTACT_CD, GenericCd.DEFAULT_LOCALE_CD);
		validateEmailAndPhoneNumber(userResource, genericCds);
		// Login user create
		Long loginUserId = loginUserRepository.save(LoginUser.builder().dateOfBirth(userResource.getDateOfBirth())
				.individual(userResource.isIndividual()).build());
		LoginUser loginUser = loginUserRepository.findById(loginUserId);
		logger.debug("Created login user id {}", loginUser);
		if (Objects.isNull(loginUser)) {
			throw new ResourceNotFoundException("Not able create an account, Contact support");
		}
		// Consent should not be part of signup
		// oAuth2AuthorizationConsentService.save(OAuth2AuthorizationConsent
		// .withId(userResource.getRegisteredClientId(),
		// loginUser.getLoginUuid().toString())
		// .authorities(t -> t.addAll(userResource.getAuthorities()))
		// .build());
		// User Name
		loginUserNameRepository.save(LoginUserName.builder().loginUserId(loginUserId)
				.firstName(userResource.getFirstName()).middleName(userResource.getMiddleName())
				.lastName(userResource.getLastName()).build());
		// Role
		loginUserRoleRepository
				.save(LoginUserRole.builder().loginUserId(loginUserId).roleCd(LoginUserRole.USER).remarks("").build());
		// Contact (i.e User ID to login)
		var contacts = new ArrayList<Contact>();
		contacts.add(Contact.builder().contactCd(Contact.EMAIL).loginUserId(loginUserId)
				.loginId(userResource.getEmail()).build());
		contacts.add(Contact.builder().contactCd(Contact.PHONE_NUMBER).loginUserId(loginUserId)
				.loginId(userResource.getPhoneNumber()).build());
		contactRepository.saveAll(contacts);
		// Password
		passwordRepository.save(Password.builder().loginUserId(loginUserId)
				.secretKey(passwordEncoder.encode(userResource.getPassword()))
				.forcePasswordChange(userResource.isForcePasswordChange()).build());
		// Token -
		if (!userResource.isForcePasswordChange()) { // Force change means account creation using internal system
			for (Contact contact : contactRepository
					.findByLoginId(Set.of(userResource.getEmail(), userResource.getPhoneNumber()))) {
				String otp = generateOtp(6);
				sendOtp(userResource.getFirstName(), contact, otp, Email.SIGNUP_FTL_TEMPLATE,
						"Account Verification OTP ");
				tokenRepository.save(Token.builder().contactId(contact.getContactId()).otp(passwordEncoder.encode(otp))
						.expiresOn(OffsetDateTime.now().plusMinutes(5)).build());

			}
		}
		return get(loginUser.getLoginUuid());
	}

	private void sendOtp(String name, Contact contact, String otp, String template, String subject) {
		logger.debug("Sending OTP {} to {}", otp, contact.getLoginId());
		if (!otpEnabled) {
			logger.debug("OTP is disabled, not sending to {}", contact.getLoginId());
			return;
		}
		Message status = null;
		if (Contact.PHONE_NUMBER.equals(contact.getContactCd())) {
			String message = "Dear " + name + ", Your OTP to SignUp is " + otp
					+ " and valid for 5 minutes. Do not disclose it to anyone for security reasons.";
			status = messageServiceClient
					.send(Message.builder().sender(smsSender).receiver(Set.of(contact.getLoginId()))
							.information(message).messageOf(contact.getLoginUserId()).build());
		} else if (Contact.EMAIL.equals(contact.getContactCd())) {
			Email email = new Email(emailSender, Set.of(contact.getLoginId()), template,
					Map.of("name", name, "otp", otp), (subject + otp), contact.getLoginUserId());
			status = messageServiceClient.send(email);
		}
		logger.debug("Email/SMS status {}", status);
	}

	/**
	 * Validation
	 * - REGEX validation for e-mail & phone number
	 * - Contact/Login Id duplication
	 * 
	 * @param userResource
	 * @param genericCds
	 */
	private void validateEmailAndPhoneNumber(UserResource userResource, List<GenericCd> genericCds) {
		logger.debug("E-mail and phone number validation");
		// E-mail validation
		validateWithRegex(genericCds, Contact.EMAIL, userResource.getEmail(),
				"The Requested E-Mail is not vaild format");
		// Phone Number validation
		validateWithRegex(genericCds, Contact.PHONE_NUMBER, userResource.getPhoneNumber(),
				"The Requested Phone Number is not vaild format");
		// User Duplication
		List<Contact> contacts = contactRepository
				.findByLoginId(Set.of(userResource.getEmail(), userResource.getPhoneNumber()));
		if (!contacts.isEmpty()) {
			String contact = contacts.stream().map(Contact::getLoginId).collect(Collectors.joining(", "));
			throw new BadRequestException(
					"Account for " + contact + " is already available, please login (OR) use forgot password");
		}
	}

	private void validateWithRegex(List<GenericCd> genericCds, Long codeCd, String value, String errorMessage) {
		Optional<String> regex = genericCds.stream()
				.filter(g -> codeCd.equals(g.getCodeCd())).map(GenericCd::getRegex).findFirst();
		if (regex.isPresent() && !validateRegex(regex.get(), value)) {
			logger.debug("Regex {} is used for {}", regex.get(), value);
			throw new BadRequestException(errorMessage);
		}
	}

	private boolean validateRegex(String regex, String value) {
		return Pattern.compile(regex).matcher(value).matches();
	}

	public UserResource get(UUID loginUuid) {
		logger.debug("Getting the user {}", loginUuid);
		LoginUser loginUser = loginUserRepository.findByUuid(loginUuid);
		if (Objects.isNull(loginUser)) {
			throw new ResourceNotFoundException("The requested user " + loginUuid + " is not available");
		}
		LoginUserName loginUserName = loginUserNameRepository.findByLoginUserId(loginUser.getLoginUserId());
		// Contact
		List<Contact> contacts = contactRepository.findAllByLoginUserId(loginUser.getLoginUserId());
		// Password
		Password password = passwordRepository.findByLoginUserId(loginUser.getLoginUserId());
		return buildUserResource(loginUser, loginUserName, contacts, password);
	}

	private UserResource get(Long loginUserId) {
		LoginUser loginUser = loginUserRepository.findById(loginUserId);
		if (Objects.isNull(loginUser)) {
			throw new ResourceNotFoundException("The requested user " + loginUserId + " is not available");
		}
		return get(loginUser.getLoginUuid());
	}

	private UserResource buildUserResource(LoginUser loginUser, LoginUserName loginUserName, List<Contact> contacts,
			Password password) {
		UserResource userResource = new UserResource();
		// Login User
		userResource.setLoginUuid(loginUser.getLoginUuid());
		userResource.setDateOfBirth(loginUser.getDateOfBirth());
		userResource.setIndividual(loginUser.isIndividual());
		userResource.setAccountCreatedOn(loginUser.getRowCreatedOn());
		// Login User Name
		userResource.setFirstName(loginUserName.getFirstName());
		userResource.setMiddleName(loginUserName.getMiddleName());
		userResource.setLastName(loginUserName.getLastName());
		// Force password
		userResource.setForcePasswordChange(password.isForcePasswordChange());
		// Contact
		for (Contact contact : contacts) {
			if (contact.getEndTime().isBefore(OffsetDateTime.now())) {
				continue;
			}
			if (Contact.EMAIL.equals(contact.getContactCd())) {
				userResource.setEmail(contact.getLoginId());
			}
			if (Contact.PHONE_NUMBER.equals(contact.getContactCd())) {
				userResource.setPhoneNumber(contact.getLoginId());
			}
		}
		return userResource;
	}

	/**
	 * Change the profile name
	 * 
	 * @param userResource
	 * @return {@link UserResource}
	 */
	@Transactional
	public UserResource update(UserResource userResource) {
		logger.debug("Changing the name for  {}", userResource);
		LoginUser loginUserDb = loginUserRepository.findByUuid(userResource.getLoginUuid());
		if (loginUserDb == null) {
			throw new ResourceNotFoundException("The requested user is not available in the system");
		}
		LoginUserName loginUserNameDb = loginUserNameRepository.findByLoginUserId(loginUserDb.getLoginUserId());
		if (userResource.getFirstName() == null) {
			throw new BadRequestException("First name can't be empty");
		}
		boolean newChange = false;
		LoginUserName loginUserName = LoginUserName.builder().loginUserId(loginUserDb.getLoginUserId())
				.firstName(userResource.getFirstName()).middleName(userResource.getMiddleName())
				.lastName(userResource.getLastName()).build();
		if (!loginUserNameDb.equals(loginUserName)) {
			loginUserNameRepository.save(loginUserName);
			newChange = true;
		}
		LoginUser loginUser = new LoginUser(loginUserDb);
		loginUser.setDateOfBirth(userResource.getDateOfBirth());
		loginUser.setIndividual(userResource.isIndividual());
		if (!loginUser.equals(loginUserDb)) {
			loginUserRepository.update(loginUser);
			newChange = true;
		}
		if (!newChange) {
			throw new BadRequestException("User details are same, nothing to update");
		}
		return get(userResource.getLoginUuid());
	}

	public Object login(@Valid Login login) {
		// TODO Auto-generated method stub
		return null;
	}

	/**
	 * Generate OTP
	 * 
	 * @param otpLength
	 * @return OTP
	 */
	private String generateOtp(int otpLength) {
		StringBuilder generatedOTP = new StringBuilder();
		SecureRandom secureRandom = new SecureRandom();
		try {
			secureRandom = SecureRandom.getInstance(secureRandom.getAlgorithm());
			for (int i = 0; i < otpLength; i++) {
				generatedOTP.append(secureRandom.nextInt(9));
			}
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}
		logger.debug("Generated OTP {}", generatedOTP);
		return generatedOTP.toString();
	}

	@Transactional
	public boolean verifyContact(ContactVerify contactVerify) {
		logger.debug("Verifying contact account {}", contactVerify);
		Contact contact = contactRepository.findActiveLoginIdByLoginId(contactVerify.getContact());
		String errorMessage = "The requested login ID ";
		if (Objects.isNull(contact)) {
			errorMessage += contactVerify.getContact() + " is not available in the database";
			logger.debug(errorMessage);
			throw new ResourceNotFoundException(errorMessage);
		} else if (Objects.nonNull(contact.getVerifiedOn())) {
			errorMessage += contact.getLoginId() + " is already Verified on " + contact.getVerifiedOn();
			logger.debug(errorMessage);
			throw new BadRequestException(errorMessage);
		}
		// Check the OTP
		Token token = tokenRepository.findByContactId(contact.getContactId());
		if (Objects.isNull(token)) {
			errorMessage += contactVerify.getContact() + " has not requested OTP / it's expired";
			logger.debug(errorMessage);
			throw new BadRequestException(errorMessage);
		}
		if (!passwordEncoder.matches(contactVerify.getOtp(), token.getOtp())) {
			errorMessage = "OTP for " + contactVerify.getContact() + " is not matching";
			logger.debug(errorMessage);
			throw new BadRequestException(errorMessage);
		}
		contact.setVerifiedOn(OffsetDateTime.now());
		return contactRepository.verify(contact.getContactId()) == 1;
	}

	/**
	 * First time OTP request
	 * Used in Forgot password 1st OTP request & change user id
	 * 
	 * @param emailId
	 * @param otp
	 * @return OTP
	 */
	@Transactional
	public boolean requestOtp(Map<String, Object> payload, String purpose) {
		String loginId = payload.get("loginId").toString();
		logger.debug("The {} requested for OTP", loginId);
		Contact contact = contactRepository.findActiveLoginIdByLoginId(loginId);
		String errorMessage;
		if (contact == null) {
			errorMessage = "The requested login ID : " + loginId + " is not available in the system";
			logger.debug(errorMessage);
			throw new ResourceNotFoundException(errorMessage);
		}
		List<Token> existToken = tokenRepository.findAllByContactId(contact.getContactId());
		if (existToken.size() > 2) {
			errorMessage = "Too many request in few minutes, Try after sometimes";
			logger.debug(errorMessage);
			throw new BadRequestException(errorMessage);
		}
		String template;
		String subject;
		if (purpose.equalsIgnoreCase("verify-signup")) {
			if (contact.getVerifiedOn() != null) {
				throw new BadRequestException("Account is already verified");
			}
			template = Email.ACCOUNT_VERIFY_FTL_TEMPLATE;
			subject = "Account Verification OTP ";
		} else if (purpose.equalsIgnoreCase("reset-password")) {
			validatePassword(contact.getLoginUserId(), payload.get("password").toString());
			template = Email.RESET_PASSWORD_FTL_TEMPLATE;
			subject = "Password Reset OTP ";
		} else {
			throw new NotImplementedException("The OTP purpose " + purpose + " is not implemented!");
		}
		String otp = generateOtp(6);
		tokenRepository.save(Token.builder().contactId(contact.getContactId()).otp(passwordEncoder.encode(otp))
				.expiresOn(OffsetDateTime.now().plusMinutes(Token.EXPIRY_TIME_IN_MINUTES)).build());
		LoginUserName loginUserName = loginUserNameRepository.findByLoginUserId(contact.getLoginUserId());
		sendOtp(loginUserName.getFirstName(), contact, otp, template, subject);
		return true;
	}

	/**
	 * Login histories of user
	 * 
	 * @param loginUuid
	 * @param page
	 * @param size
	 * @return
	 */
	public PaginatedLoginHistory loginHistories(UUID loginUuid, int page, int size) {
		logger.debug("Listing login histories {} from page {} to {}", loginUuid, page, size);
		LoginUser loginUser = loginUserRepository.findByUuid(loginUuid);
		if (Objects.isNull(loginUser)) {
			throw new ResourceNotFoundException("The reuested user is not present in the database");
		}
		return new PaginatedLoginHistory(
				loginHistoryRepository.list(loginUser.getLoginUserId(), size, ((page - 1) * size)),
				loginHistoryRepository.count(loginUser.getLoginUserId()));
	}

	@Transactional
	public boolean resetPassword(ResetPassword resetPassword) {
		logger.debug("reset password {}", resetPassword);
		Contact contact = contactRepository.findActiveLoginIdByLoginId(resetPassword.getLoginId());
		String errorMessage;
		if (contact == null) {
			errorMessage = "The requested login ID : " + resetPassword.getLoginId() + " is not available in the system";
			logger.debug(errorMessage);
			throw new ResourceNotFoundException(errorMessage);
		}
		LoginUserName loginUserName = loginUserNameRepository.findByLoginUserId(contact.getLoginUserId());
		Token token = tokenRepository.findByContactId(contact.getContactId());
		if (Objects.isNull(token)) {
			errorMessage = contact.getLoginId() + " has not requested OTP / it's expired";
			logger.debug(errorMessage);
			throw new BadRequestException(errorMessage);
		} else if (!passwordEncoder.matches(resetPassword.getOtp(), token.getOtp())) {
			throw new BadRequestException("The entered OTP is not valid");
		}
		String newPassword = resetPassword.getPassword();
		validatePassword(contact.getLoginUserId(), newPassword);
		passwordRepository.save(Password.builder().loginUserId(contact.getLoginUserId())
				.secretKey(passwordEncoder.encode(newPassword)).build());
		if (contact.getVerifiedOn() == null) { // Verify the contact
			contactRepository.verify(contact.getContactId());
		}
		// messageServiceClient.send(new Email(emailSender,
		// Set.of(contact.getLoginId()), Email.RESET_PASSWORD_SUCCESS_FTL,
		// Map.of("name", loginUserName.getFirstName()), "Your password has been
		// successfully reset",
		// contact.getLoginUserId()));
		return true;

	}

	private void validatePassword(Long loginUserId, String password) {
		if (!Password.passwordComplexity.test(password)) {
			logger.debug("Password complexity");
			throw new BadRequestException("Password must contain atleast 1 digit, 1 special character,"
					+ " 1 lowercase, 1 uppercase & minimum length of 8");
		}
		List<Password> passwords = passwordRepository.findAllByLastNRowLoginUserId(loginUserId, 3);
		boolean matches = passwords.stream().anyMatch(p -> passwordEncoder.matches(password, p.getSecretKey()));
		if (matches) {
			throw new BadRequestException("New password must not match with last 3 password");
		}
	}

	public PaginatedUser list(Pagination pagination) {
		logger.debug("Lsting users with {}", pagination);
		var userResources = new ArrayList<UserResource>();
		List<LoginUser> loginUsers = loginUserRepository.findAll(pagination);
		for (LoginUser loginUser : loginUsers) {
			userResources.add(get(loginUser.getLoginUuid()));
		}
		return new PaginatedUser(userResources, loginUserRepository.count());
	}

	/**
	 * List users by their role
	 * 
	 * @param roleCd
	 * @param page
	 * @param size
	 * @return {@link UserResource}
	 */
	public List<UserResource> listUserByRole(Long roleCd, int page, int size) {
		logger.debug("List users by roleCd {} on page {} with size {}", roleCd, page, size);
		List<UserResource> userResources = new ArrayList<>();
		List<LoginUserRole> loginUserRoles = loginUserRoleRepository.findAllByLoginUserRole(roleCd, page, size);
		for (var loginUserRole : loginUserRoles) {
			userResources.add(get(loginUserRole.getLoginUserId()));
		}
		return userResources;
	}

}
