package io.github.thirumalx.service;

import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import io.github.thirumalx.exception.ResourceNotFoundException;
import io.github.thirumalx.exception.UnAuthorizedException;
import io.github.thirumalx.model.Contact;
import io.github.thirumalx.model.ContactResource;
import io.github.thirumalx.model.LoginUser;
import io.github.thirumalx.model.UserResource;
import io.github.thirumalx.repository.ContactRepository;
import io.github.thirumalx.repository.LoginUserRepository;

/**
 * @author Thirumal
 */
@Service
public class PersonalInformationService {

    private final Logger logger = LoggerFactory.getLogger(PersonalInformationService.class);

    private final UserService userService;
    private final ContactRepository contactRepository;
    private final LoginUserRepository loginUserRepository;

    public PersonalInformationService(UserService userService, ContactRepository contactRepository, LoginUserRepository loginUserRepository) {
        this.userService = userService;
        this.contactRepository = contactRepository;
        this.loginUserRepository = loginUserRepository;
    }

    public UserResource getPersonalInfo() {
        logger.debug("Getting personal information..");
        // 1. Get the current authentication object
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new UnAuthorizedException("User is not authenticated");
        }
        // 2. Extract the identifier (LoginUuid)
        // UserDetailsServiceImpl stores the UUID as the username
        String identifier = authentication.getName();

        logger.debug("Fetching personal info for user UUID: {}", identifier);

        // 3. Use UserService to fetch by UUID
        try {
            return userService.get(UUID.fromString(identifier));
        } catch (IllegalArgumentException e) {
            logger.error("Invalid UUID format in authentication principal: {}", identifier);
            throw new UnAuthorizedException("Invalid user identifier");
        }
    }

    public List<String> getContact(Long contactCd) {
        logger.debug("Getting email information..");
        UUID loginUuid = getCurrentUserUuid();
        return userService.getContact(loginUuid, contactCd);
    }

    public List<ContactResource> getContactResources(Long contactCd) {
        logger.debug("Getting contact resources for code: {}", contactCd);
        Long loginUserId = getCurrentUserLoginUserId();
        List<Contact> contacts = contactRepository.findAllByLoginUserId(loginUserId);
        return contacts.stream()
                .filter(c -> contactCd.equals(c.getContactCd()))
                .map(this::mapToResource)
                .toList();
    }

    public void addEmail(String email) {
        logger.debug("Adding new email: {}", email);
        Long loginUserId = getCurrentUserLoginUserId();
        // Check if email already exists
        List<Contact> existing = contactRepository.findByLoginId(java.util.Set.of(email));
        if (!existing.isEmpty()) {
            throw new io.github.thirumalx.exception.BadRequestException("Email already exists");
        }
        Contact contact = Contact.builder()
                .loginUserId(loginUserId)
                .contactCd(Contact.EMAIL)
                .loginId(email)
                .build();
        contactRepository.save(contact);
    }

    public void deleteContact(Long contactId) {
        logger.debug("Deleting contact: {}", contactId);
        Long loginUserId = getCurrentUserLoginUserId();
        Contact contact = contactRepository.findById(contactId);
        if (contact == null || !contact.getLoginUserId().equals(loginUserId)) {
            throw new ResourceNotFoundException("Contact not found or unauthorized");
        }
        contactRepository.delete(contactId);
    }

    public void updateEmail(Long contactId, String newEmail) {
        logger.debug("Updating contact {} to new email: {}", contactId, newEmail);
        // 1. Validation
        if (newEmail == null || !newEmail.contains("@") || !newEmail.contains(".")) {
            throw new io.github.thirumalx.exception.BadRequestException("Invalid email format");
        }
        Long loginUserId = getCurrentUserLoginUserId();
        // 2. Ownership check
        Contact contact = contactRepository.findById(contactId);
        if (contact == null || !contact.getLoginUserId().equals(loginUserId)) {
            throw new ResourceNotFoundException("Contact not found or unauthorized");
        }
        // 3. Duplicate check (if different)
        if (!contact.getLoginId().equalsIgnoreCase(newEmail)) {
            List<Contact> existing = contactRepository.findByLoginId(java.util.Set.of(newEmail));
            if (!existing.isEmpty()) {
                throw new io.github.thirumalx.exception.BadRequestException("Email address is already in use");
            }
            contact.setLoginId(newEmail);
            contactRepository.update(contact);
        }
    }

    private ContactResource mapToResource(Contact contact) {
        return ContactResource.builder()
                .contactId(contact.getContactId())
                .loginId(contact.getLoginId())
                .contactCd(contact.getContactCd())
                .verifiedOn(contact.getVerifiedOn())
                .verified(contact.getVerifiedOn() != null)
                .primary(false) // Logic for primary could be refined later
                .build();
    }

    private UUID getCurrentUserUuid() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new UnAuthorizedException("User is not authenticated");
        }
        return UUID.fromString(authentication.getName());
    }

    private Long getCurrentUserLoginUserId() {
        UUID loginUuid = getCurrentUserUuid();
        LoginUser loginUser = loginUserRepository.findByUuid(loginUuid);
        if (loginUser == null) {
            throw new ResourceNotFoundException("User not found");
        }
        return loginUser.getLoginUserId();
    }

}
