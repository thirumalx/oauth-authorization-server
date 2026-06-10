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

import io.github.thirumalx.model.AllowedIp;
import io.github.thirumalx.service.AllowedIpService;

/**
 * Controller exposing endpoints to configure allowed client IP addresses/ranges.
 *
 * @author Thirumal
 */
@RestController
@RequestMapping("/allowed-ip")
public class AllowedIpController {

    private final Logger logger = LoggerFactory.getLogger(AllowedIpController.class);

    private final AllowedIpService allowedIpService;

    public AllowedIpController(AllowedIpService allowedIpService) {
        this.allowedIpService = allowedIpService;
    }

    @PostMapping("")
    public ResponseEntity<AllowedIp> create(@RequestBody AllowedIp allowedIp) {
        logger.debug("Creating Allowed IP: {}", allowedIp);
        return ResponseEntity.ok(allowedIpService.save(allowedIp));
    }

    @GetMapping("")
    public ResponseEntity<List<AllowedIp>> list() {
        logger.debug("Listing Allowed IPs");
        return ResponseEntity.ok(allowedIpService.list());
    }

    @PutMapping("/{allowedIpId}")
    public ResponseEntity<AllowedIp> update(@PathVariable Long allowedIpId, @RequestBody AllowedIp allowedIp) {
        logger.debug("Updating Allowed IP ID {}: {}", allowedIpId, allowedIp);
        allowedIp.setAllowedIpId(allowedIpId);
        return ResponseEntity.ok(allowedIpService.update(allowedIp));
    }

    @DeleteMapping("/{allowedIpId}")
    public ResponseEntity<Void> delete(@PathVariable Long allowedIpId) {
        logger.debug("Deleting Allowed IP ID {}", allowedIpId);
        allowedIpService.delete(allowedIpId);
        return ResponseEntity.ok().build();
    }
}
