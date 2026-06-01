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

import io.github.thirumalx.model.Mfa;
import io.github.thirumalx.service.MfaService;

/**
 * @author Thirumal
 *
 */
@RestController
@RequestMapping("/mfa")
public class MfaController {

	private final Logger logger = LoggerFactory.getLogger(MfaController.class);

	private final MfaService mfaService;

	public MfaController(MfaService mfaService) {
		this.mfaService = mfaService;
	}

	@GetMapping("/totp/setup")
	public ResponseEntity<java.util.Map<String, String>> setupTotp() {
		logger.debug("Setting up TOTP secret and QR URI");
		return ResponseEntity.ok(mfaService.setupTotp());
	}

	@PostMapping("")
	public ResponseEntity<Mfa> enableMfa(@RequestBody Mfa mfa) {
		logger.debug("Enabling MFA: {}", mfa);
		return ResponseEntity.ok(mfaService.enable(mfa));
	}

	@GetMapping("")
	public ResponseEntity<List<Mfa>> list() {
		logger.debug("Listing MFA configurations");
		return ResponseEntity.ok(mfaService.list());
	}

	@PutMapping("/{mfaId}")
	public ResponseEntity<Mfa> updateMfa(@PathVariable Long mfaId, @RequestBody Mfa mfa) {
		logger.debug("Updating MFA config ID {}: {}", mfaId, mfa);
		mfa.setMfaId(mfaId);
		return ResponseEntity.ok(mfaService.update(mfa));
	}

	@DeleteMapping("/{mfaId}")
	public ResponseEntity<Void> deleteMfa(@PathVariable Long mfaId) {
		logger.debug("Deleting/disabling MFA config ID {}", mfaId);
		mfaService.delete(mfaId);
		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/disable-all/{loginUuid}")
	public ResponseEntity<Integer> disableMfa(@PathVariable String loginUuid) {
		logger.debug("Disabling all MFA for user UUID {}", loginUuid);
		return ResponseEntity.ok(mfaService.disable(loginUuid));
	}

}
