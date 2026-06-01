package io.github.thirumalx.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import io.github.thirumalx.exception.BadRequestException;
import io.github.thirumalx.model.AllowedIp;
import io.github.thirumalx.repository.AllowedIpRepository;
import io.github.thirumalx.security.IAuthenticationFacade;

/**
 * Service managing Allowed IP range rules.
 * Auto-suffixes raw IP addresses with correct network widths.
 *
 * @author Thirumal
 */
@Service
public class AllowedIpService {

    private final Logger logger = LoggerFactory.getLogger(AllowedIpService.class);

    @Autowired
    private AllowedIpRepository allowedIpRepository;

    @Autowired
    private IAuthenticationFacade authenticationFacade;

    @Transactional
    public AllowedIp save(AllowedIp allowedIp) {
        logger.debug("Saving Allowed IP range: {}", allowedIp);
        Long loginUserId = authenticationFacade.getLoginId();
        allowedIp.setLoginUserId(loginUserId);
        
        // Basic CIDR validation
        if (allowedIp.getIpRange() == null || allowedIp.getIpRange().trim().isEmpty()) {
            throw new BadRequestException("IP Range must not be empty.");
        }
        
        String ipRange = allowedIp.getIpRange().trim();
        
        // Auto-suffix /32 for single IPv4 if prefix is omitted
        if (ipRange.matches("^[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}$")) {
            ipRange = ipRange + "/32";
        }
        // Auto-suffix /128 for single IPv6 if prefix is omitted
        if (ipRange.contains(":") && !ipRange.contains("/")) {
            ipRange = ipRange + "/128";
        }
        
        allowedIp.setIpRange(ipRange);

        Long id = allowedIpRepository.save(allowedIp);
        return get(id);
    }

    public AllowedIp get(Long id) {
        return allowedIpRepository.findById(id);
    }

    public List<AllowedIp> list() {
        logger.debug("Listing Allowed IPs for active user session");
        Long loginUserId = authenticationFacade.getLoginId();
        return allowedIpRepository.findByLoginUserId(loginUserId);
    }

    @Transactional
    public AllowedIp update(AllowedIp allowedIp) {
        logger.debug("Updating Allowed IP: {}", allowedIp);
        Long loginUserId = authenticationFacade.getLoginId();
        allowedIp.setLoginUserId(loginUserId);
        
        // Basic format cleaning
        if (allowedIp.getIpRange() == null || allowedIp.getIpRange().trim().isEmpty()) {
            throw new BadRequestException("IP Range must not be empty.");
        }
        String ipRange = allowedIp.getIpRange().trim();
        if (ipRange.matches("^[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}$")) {
            ipRange = ipRange + "/32";
        }
        if (ipRange.contains(":") && !ipRange.contains("/")) {
            ipRange = ipRange + "/128";
        }
        allowedIp.setIpRange(ipRange);
        
        allowedIpRepository.update(allowedIp);
        return get(allowedIp.getAllowedIpId());
    }

    @Transactional
    public void delete(Long allowedIpId) {
        logger.debug("Deleting Allowed IP ID: {}", allowedIpId);
        Long loginUserId = authenticationFacade.getLoginId();
        allowedIpRepository.delete(allowedIpId, loginUserId);
    }
}
