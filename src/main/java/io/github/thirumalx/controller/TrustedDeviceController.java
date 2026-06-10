package io.github.thirumalx.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.thirumalx.model.TrustedDevice;
import io.github.thirumalx.repository.TrustedDeviceRepository;
import io.github.thirumalx.security.IAuthenticationFacade;

@RestController
@RequestMapping("/trusted-device")
public class TrustedDeviceController {

    private final Logger logger = LoggerFactory.getLogger(TrustedDeviceController.class);

    private final TrustedDeviceRepository trustedDeviceRepository;
    private final IAuthenticationFacade authenticationFacade;

    public TrustedDeviceController(TrustedDeviceRepository trustedDeviceRepository, IAuthenticationFacade authenticationFacade) {
        this.trustedDeviceRepository = trustedDeviceRepository;
        this.authenticationFacade = authenticationFacade;
    }

    @GetMapping("")
    public ResponseEntity<List<TrustedDevice>> list() {
        logger.debug("Request to list Trusted Devices");
        Long loginUserId = authenticationFacade.getLoginId();
        return ResponseEntity.ok(trustedDeviceRepository.findAllByLoginUserId(loginUserId));
    }
}
