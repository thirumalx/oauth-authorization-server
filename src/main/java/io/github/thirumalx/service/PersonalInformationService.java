package io.github.thirumalx.service;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import io.github.thirumalx.exception.UnAuthorizedException;
import io.github.thirumalx.model.UserResource;

/**
 * @author Thirumal
 */
@Service
public class PersonalInformationService {

    private final Logger logger = LoggerFactory.getLogger(PersonalInformationService.class);

    private final UserService userService;

    public PersonalInformationService(UserService userService) {
        this.userService = userService;
    }

    public UserResource getPersonalInfo() {
        logger.debug("Getting personal information..");
        // 1. Get the current authentication object
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
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

}
