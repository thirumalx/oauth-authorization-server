package io.github.thirumalx.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.thirumalx.model.Address;
import io.github.thirumalx.service.AddressService;

/**
 * Controller exposing endpoints for actual Address management and dropdown lookups.
 *
 * @author Antigravity
 */
@RestController
@RequestMapping("/address")
public class AddressController {

    private final Logger logger = LoggerFactory.getLogger(AddressController.class);

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @PostMapping("")
    public ResponseEntity<Address> create(@RequestBody Address address) {
        logger.debug("Request to create Address: {}", address);
        return ResponseEntity.ok(addressService.create(address));
    }

    @GetMapping("")
    public ResponseEntity<List<Address>> list() {
        logger.debug("Request to list Addresses");
        return ResponseEntity.ok(addressService.list());
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<Address> update(@PathVariable Long addressId, @RequestBody Address address) {
        logger.debug("Request to update Address ID {}: {}", addressId, address);
        address.setAddressId(addressId);
        return ResponseEntity.ok(addressService.update(address));
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> delete(@PathVariable Long addressId) {
        logger.debug("Request to delete Address ID {}", addressId);
        addressService.delete(addressId);
        return ResponseEntity.ok().build();
    }
}
