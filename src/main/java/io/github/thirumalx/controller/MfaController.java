/**
 * 
 */
package io.github.thirumalx.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
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
	
	Logger logger = LoggerFactory.getLogger(MfaController.class);
	
	MfaService mfaService;
	
	@PostMapping("")
	public Mfa enableMfa(Mfa mfa) {
		return mfaService.enable(mfa);
	}
	
	@DeleteMapping("/{loginUuid}")
	public int disableMfa(String loginUuid) {
		return mfaService.disable(loginUuid);
	}
	
}
