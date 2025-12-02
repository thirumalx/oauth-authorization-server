/**
 * 
 */
package io.github.thirumalx.service;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import io.github.thirumalx.exception.BadRequestException;
import io.github.thirumalx.model.LoginUser;
import io.github.thirumalx.model.Mfa;
import io.github.thirumalx.repository.LoginUserRepository;
import io.github.thirumalx.repository.MfaRepository;

/**
 * @author Thirumal
 *
 */
@Service
public class MfaService {

	Logger logger = LoggerFactory.getLogger(MfaService.class);
	
	@Autowired
	private LoginUserRepository loginUserRepository;
	@Autowired
	private MfaRepository mfaRepository;
	
	@Transactional
	public Mfa enable(Mfa mfa) {
		logger.debug("Enabling MFA {}", mfa);
		Long id = mfaRepository.save(mfa);
		return get(id);
	}
	
	public Mfa get(Long id) {
		return mfaRepository.findById(id);
	}

	@Transactional
	public int disable(String loginUuid) {
		LoginUser loginUser = loginUserRepository.findByUuid(UUID.fromString(loginUuid));
		if (loginUser == null) {
			throw new BadRequestException("The requested user is not available in the database");
		}
		return mfaRepository.disable(loginUser.getLoginUserId());
	}

}
