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
import org.springframework.context.event.EventListener;
import org.springframework.security.authentication.event.InteractiveAuthenticationSuccessEvent;
import org.springframework.security.authentication.event.AbstractAuthenticationEvent;

@Component
public class AuthenticationSuccessListener {

	private final Logger logger = LoggerFactory.getLogger(this.getClass());
	
	@Autowired
	private LoginUserRepository loginUserRepository;
	@Autowired
	private LoginHistoryRepository loginHistoryRepository;
	@Autowired
	private TrustedDeviceRepository trustedDeviceRepository;
	
	@EventListener
	@Transactional
	public void onAuthenticationSuccessEvent(AuthenticationSuccessEvent event) {  
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
			logger.debug("Authentication principal class: {}", event.getAuthentication().getPrincipal().getClass().getName());
			logger.debug("It's client id or unparseable UUID.....Ignoring..... userName was: '{}'", userName);
			try {
				java.nio.file.Files.writeString(java.nio.file.Paths.get("passkey_debug.txt"), 
					"FAILED: userName='" + userName + "', principalClass=" + event.getAuthentication().getPrincipal().getClass().getName() + "\n",
					java.nio.file.StandardOpenOption.CREATE, java.nio.file.StandardOpenOption.APPEND);
			} catch(Exception ignored) {}
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
			if (Boolean.TRUE.equals(request.getAttribute("LOGIN_RECORDED"))) {
				logger.debug("Login already recorded in this request. Skipping.");
				return;
			}
			request.setAttribute("LOGIN_RECORDED", true);
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
		try {
			java.nio.file.Files.writeString(java.nio.file.Paths.get("passkey_debug.txt"), 
				"SUCCESS! Saved login history for " + loginId + " | userName=" + userName + "\n",
				java.nio.file.StandardOpenOption.CREATE, java.nio.file.StandardOpenOption.APPEND);
		} catch(Exception ignored) {}
	}

	@EventListener
	@Transactional
	public void onInteractiveAuthenticationSuccessEvent(InteractiveAuthenticationSuccessEvent event) {
		logger.debug("Interactive Login Success event : {}", event);
		try {
			java.nio.file.Files.writeString(java.nio.file.Paths.get("passkey_debug.txt"), 
				"INTERACTIVE EVENT CAUGHT! class=" + event.getAuthentication().getClass().getName() + " | userName=" + event.getAuthentication().getName() + "\n",
				java.nio.file.StandardOpenOption.CREATE, java.nio.file.StandardOpenOption.APPEND);
		} catch(Exception ignored) {}
		this.onAuthenticationSuccessEvent(new AuthenticationSuccessEvent(event.getAuthentication()));
	}

	@EventListener
	public void onAbstractAuthenticationEvent(AbstractAuthenticationEvent event) {
		try {
			java.nio.file.Files.writeString(java.nio.file.Paths.get("passkey_debug.txt"), 
				"ABSTRACT EVENT: " + event.getClass().getName() + " | authClass=" + event.getAuthentication().getClass().getName() + " | userName=" + event.getAuthentication().getName() + "\n",
				java.nio.file.StandardOpenOption.CREATE, java.nio.file.StandardOpenOption.APPEND);
		} catch(Exception ignored) {}
	}
}
