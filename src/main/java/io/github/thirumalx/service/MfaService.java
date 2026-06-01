/**
 * 
 */
package io.github.thirumalx.service;

import java.util.List;
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
import io.github.thirumalx.security.IAuthenticationFacade;

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
	@Autowired
	private IAuthenticationFacade authenticationFacade;

	@Transactional
	public Mfa enable(Mfa mfa) {
		logger.debug("Enabling MFA {}", mfa);
		Long loginUserId = authenticationFacade.getLoginId();
		mfa.setLoginUserId(loginUserId);
		
		// Actual verification for TOTP with Authenticator app
		if (mfa.getMfaCd() != null && mfa.getMfaCd() == 4) {
			if (!io.github.thirumalx.util.TotpUtil.verifyCode(mfa.getSecret(), mfa.getCode())) {
				throw new BadRequestException("Invalid 6-digit verification code. Please check your authenticator app.");
			}
		}

		if (mfa.isPrimaryMfa()) {
			List<Mfa> existingList = mfaRepository.findByLoginUserId(loginUserId);
			for (Mfa existing : existingList) {
				if (existing.isPrimaryMfa()) {
					existing.setPrimaryMfa(false);
					mfaRepository.update(existing);
				}
			}
		}
		Long id = mfaRepository.save(mfa);
		return get(id);
	}

	public java.util.Map<String, String> setupTotp() {
		Long loginUserId = authenticationFacade.getLoginId();
		LoginUser loginUser = loginUserRepository.findById(loginUserId);
		String secret = io.github.thirumalx.util.TotpUtil.generateSecret();
		String username = (loginUser != null && loginUser.getLoginUuid() != null)
				? loginUser.getLoginUuid().toString()
				: "User_" + loginUserId;
		String qrUri = io.github.thirumalx.util.TotpUtil.getQrUri(secret, "OAuthServer", username);
		
		java.util.Map<String, String> result = new java.util.HashMap<>();
		result.put("secret", secret);
		result.put("qrUri", qrUri);
		return result;
	}

	public Mfa get(Long id) {
		return mfaRepository.findById(id);
	}

	@Transactional
	public Mfa update(Mfa mfa) {
		logger.debug("Updating MFA {}", mfa);
		Long loginUserId = authenticationFacade.getLoginId();
		mfa.setLoginUserId(loginUserId);
		if (mfa.isPrimaryMfa()) {
			List<Mfa> existingList = mfaRepository.findByLoginUserId(loginUserId);
			for (Mfa existing : existingList) {
				if (existing.isPrimaryMfa() && !existing.getMfaId().equals(mfa.getMfaId())) {
					existing.setPrimaryMfa(false);
					mfaRepository.update(existing);
				}
			}
		}
		mfaRepository.update(mfa);
		return get(mfa.getMfaId());
	}

	@Transactional
	public void delete(Long mfaId) {
		logger.debug("Deleting MFA with ID {}", mfaId);
		Long loginUserId = authenticationFacade.getLoginId();
		mfaRepository.delete(mfaId, loginUserId);
	}

	@Transactional
	public int disable(String loginUuid) {
		LoginUser loginUser = loginUserRepository.findByUuid(UUID.fromString(loginUuid));
		if (loginUser == null) {
			throw new BadRequestException("The requested user is not available in the database");
		}
		return mfaRepository.disable(loginUser.getLoginUserId());
	}

	public List<Mfa> list() {
		logger.debug("Listing MFA.....");
		Long loginUserId = authenticationFacade.getLoginId();
		return mfaRepository.findByLoginUserId(loginUserId);
	}

}
