/**
 * 
 */
package io.github.thirumalx.handler;

import java.util.Objects;
import java.util.UUID;

import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2AuthorizationCodeRequestAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import io.github.thirumalx.model.LoginHistory;
import io.github.thirumalx.model.LoginUser;
import io.github.thirumalx.model.TrustedDevice;
import io.github.thirumalx.repository.LoginHistoryRepository;
import io.github.thirumalx.repository.LoginUserRepository;
import io.github.thirumalx.repository.TrustedDeviceRepository;
import ua_parser.Client;
import ua_parser.Parser;

/**
 * @author Thirumal
 * Update the number of login attempt made by user to Zero 0
 */
@Component
public class AuthenticationSuccessListener implements ApplicationListener<AuthenticationSuccessEvent> {

	private final Logger logger = LoggerFactory.getLogger(this.getClass());
	
	@Autowired
	private LoginUserRepository loginUserRepository;
	@Autowired
	private LoginHistoryRepository loginHistoryRepository;
	@Autowired
	private TrustedDeviceRepository trustedDeviceRepository;
	
	@Override
	@Transactional
	public void onApplicationEvent(AuthenticationSuccessEvent event) {  
		logger.debug("Login Success event : {}", event);
		String userName  = event.getAuthentication().getName();
		if (event.getSource() instanceof OAuth2AuthorizationCodeRequestAuthenticationToken) {
			logger.debug("Authorization code request....after success login.....Ignoring....");
			return;
		}
		UUID loginId;
		try {
			loginId = UUID.fromString(userName);
		} catch (IllegalArgumentException e) {
			logger.debug("It's client id.....Ignoring.....");
			return;
		}
		LoginUser loginUser = loginUserRepository.findByUuid(loginId);
		if (Objects.isNull(loginUser)) {
			logger.debug("It's client id login.....Ignoring.....");
			return;
		} 
		
		String ipAddress = null;
		String userAgentStr = null;
		ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
		if (attributes != null) {
			HttpServletRequest request = attributes.getRequest();
			ipAddress = request.getRemoteAddr();
			userAgentStr = request.getHeader("User-Agent");
		}
		
		Long trustedDeviceId = null;
		if (userAgentStr != null) {
			try {
				Parser uaParser = new Parser();
				Client c = uaParser.parse(userAgentStr);

				String platformName = c.os.family;
				String platformVersion = c.os.major + (c.os.minor != null ? "." + c.os.minor : "");
				String clientName = c.userAgent.family;
				String clientVersion = c.userAgent.major + (c.userAgent.minor != null ? "." + c.userAgent.minor : "");
				String deviceDescription = c.device.family;

				String deviceIdentifier = java.util.UUID.nameUUIDFromBytes((userAgentStr + ipAddress).getBytes()).toString();

				TrustedDevice trustedDevice = trustedDeviceRepository.findByDeviceIdentifierAndLoginUserId(deviceIdentifier, loginUser.getLoginUserId());
				if (trustedDevice == null) {
					trustedDevice = TrustedDevice.builder()
							.loginUserId(loginUser.getLoginUserId())
							.deviceCd(TrustedDevice.determineDeviceCd(c))
							.accessTypeCd(TrustedDevice.determineAccessTypeCd(c))
							.deviceIdentifier(deviceIdentifier)
							.deviceDescription(deviceDescription)
							.platformName(platformName)
							.platformVersion(platformVersion)
							.clientName(clientName)
							.clientVersion(clientVersion)
							.trusted(true)
							.build();
					trustedDeviceId = trustedDeviceRepository.save(trustedDevice);
				} else {
					trustedDeviceId = trustedDevice.getTrustedDeviceId();
					trustedDeviceRepository.updateLastSeen(trustedDeviceId);
				}
			} catch (Exception e) {
				logger.error("Error parsing user agent or saving trusted device", e);
			}
		}

		loginHistoryRepository.save(LoginHistory.builder()
				.loginUserId(loginUser.getLoginUserId())
				.successLogin(true)
				.ipAddress(ipAddress)
				.trustedDeviceId(trustedDeviceId)
				.build());
	}
}
