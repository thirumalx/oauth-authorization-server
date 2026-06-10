package io.github.thirumalx.model;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.Objects;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * @author Thirumal M
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class TrustedDevice implements Serializable {

	private static final long serialVersionUID = 1L;

	private Long trustedDeviceId;
	private Long loginUserId;
	private Short deviceCd;
	private String deviceLocale;
	private Short accessTypeCd;
	private String accessTypeLocale;
	private String deviceDescription;
	private String deviceIdentifier;
	private String platformName;
	private String platformVersion;
	private String clientName;
	private String clientVersion;
	private boolean trusted;
	private OffsetDateTime firstSeenAt;
	private OffsetDateTime lastSeenAt;
	private OffsetDateTime startTime;
	private OffsetDateTime endTime;

	public static final Short DEFAULT_DEVICE_CD = 0;
	public static final Short DEFAULT_ACCESS_TYPE_CD = 0;

	// Access Type Constants
	public static final Short ACCESS_OTHER_UNKNOWN = 0;
	public static final Short ACCESS_WEB_BROWSER = 1;
	public static final Short ACCESS_MOBILE_APP = 2;
	public static final Short ACCESS_DESKTOP_APP = 3;
	public static final Short ACCESS_SMART_TV_APP = 4;
	public static final Short ACCESS_API_CLIENT = 5;
	public static final Short ACCESS_SERVICE_ACCOUNT = 6;
	public static final Short ACCESS_CLI_TOOL = 7;

	// Device Type Constants
	public static final Short DEVICE_OTHER_UNKNOWN = 0;
	public static final Short DEVICE_DESKTOP = 1;
	public static final Short DEVICE_LAPTOP = 2;
	public static final Short DEVICE_SMARTPHONE = 3;
	public static final Short DEVICE_TABLET = 4;
	public static final Short DEVICE_SMART_TV = 5;
	public static final Short DEVICE_IOT_DEVICE = 6;
	public static final Short DEVICE_SERVER = 7;

	public Short getDeviceCd() {
		if (Objects.isNull(deviceCd)) {
			return DEFAULT_DEVICE_CD;
		}
		return deviceCd;
	}

	public Short getAccessTypeCd() {
		if (Objects.isNull(accessTypeCd)) {
			return DEFAULT_ACCESS_TYPE_CD;
		}
		return accessTypeCd;
	}

	public static Short determineAccessTypeCd(ua_parser.Client c) {
		if (c == null || c.userAgent == null || c.userAgent.family == null) {
			return ACCESS_OTHER_UNKNOWN;
		}
		String family = c.userAgent.family.toLowerCase();
		if (family.contains("curl") || family.contains("wget")) {
			return ACCESS_CLI_TOOL;
		} else if (family.contains("postman") || family.contains("insomnia") || family.contains("axios") 
				|| family.contains("java") || family.contains("python") || family.contains("apache") || family.contains("httpclient")) {
			return ACCESS_API_CLIENT;
		} else {
			return ACCESS_WEB_BROWSER;
		}
	}

	public static Short determineDeviceCd(ua_parser.Client c) {
		if (c == null) {
			return DEVICE_OTHER_UNKNOWN;
		}
		String deviceFamily = c.device != null && c.device.family != null ? c.device.family.toLowerCase() : "";
		String osFamily = c.os != null && c.os.family != null ? c.os.family.toLowerCase() : "";
		
		if (deviceFamily.contains("tv") || osFamily.contains("tv") || deviceFamily.contains("smart tv")) {
			return DEVICE_SMART_TV;
		} else if (deviceFamily.contains("tablet") || deviceFamily.contains("ipad") || deviceFamily.contains("kindle")) {
			return DEVICE_TABLET;
		} else if (deviceFamily.contains("smartphone") || deviceFamily.contains("iphone") || osFamily.contains("android") || osFamily.contains("ios")) {
			return DEVICE_SMARTPHONE;
		} else if (osFamily.contains("windows") || osFamily.contains("mac os x") || osFamily.contains("linux") || osFamily.contains("ubuntu") || osFamily.contains("chrome os")) {
			return DEVICE_DESKTOP;
		}
		return DEVICE_OTHER_UNKNOWN;
	}
}
