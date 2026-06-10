package io.github.thirumalx.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import io.github.thirumalx.model.Address;
import io.github.thirumalx.repository.AddressRepository;
import io.github.thirumalx.security.IAuthenticationFacade;

/**
 * Service for public.address CRUD operations and lookups.
 *
 * @author Antigravity
 */
@Service
public class AddressService {

    private final Logger logger = LoggerFactory.getLogger(AddressService.class);

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private IAuthenticationFacade authenticationFacade;

    public List<Address> list() {
        Long loginUserId = authenticationFacade.getLoginId();
        logger.debug("Listing addresses for user {}", loginUserId);
        return addressRepository.findByLoginUserId(loginUserId);
    }

    public Address get(Long addressId) {
        logger.debug("Getting address with ID {}", addressId);
        return addressRepository.findById(addressId);
    }

    @Transactional
    public Address create(Address address) {
        Long loginUserId = authenticationFacade.getLoginId();
        logger.debug("Creating address {} for user {}", address, loginUserId);
        address.setLoginUserId(loginUserId);
        Long id = addressRepository.save(address);
        return get(id);
    }

    @Transactional
    public Address update(Address address) {
        Long loginUserId = authenticationFacade.getLoginId();
        logger.debug("Updating address {} for user {}", address, loginUserId);
        address.setLoginUserId(loginUserId);
        addressRepository.update(address);
        return get(address.getAddressId());
    }

    @Transactional
    public void delete(Long addressId) {
        Long loginUserId = authenticationFacade.getLoginId();
        logger.debug("Deleting address with ID {} for user {}", addressId, loginUserId);
        addressRepository.delete(addressId, loginUserId);
    }
}
