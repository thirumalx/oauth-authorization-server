package io.github.thirumalx.repository.dao;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import io.github.thirumalx.exception.BadRequestException;
import io.github.thirumalx.exception.ResourceNotFoundException;
import io.github.thirumalx.model.TrustedDevice;
import io.github.thirumalx.repository.TrustedDeviceRepository;

@Repository
public class TrustedDeviceDao extends GenericDao implements TrustedDeviceRepository {

	private static final String PK = "trusted_device_id";

	private static final String CREATE = "TrustedDevice.create";
	private static final String GET = "TrustedDevice.get";
	private static final String GET_BY_DEVICE_IDENTIFIER_AND_LOGIN_USER_ID = "TrustedDevice.getByDeviceIdentifierAndLoginUserId";
	private static final String LIST_BY_LOGIN_USER_ID = "TrustedDevice.listByLoginUserId";
	private static final String UPDATE_LAST_SEEN = "TrustedDevice.updateLastSeen";

	@Override
	public Long save(TrustedDevice trustedDevice) {
		KeyHolder holder = new GeneratedKeyHolder();
		try {
			jdbcTemplate.update(con -> setPreparedStatement(trustedDevice, con.prepareStatement(getSql(CREATE),
					new String[] { PK })), holder);
			return Optional.ofNullable(holder.getKey())
					.orElseThrow(() -> new ResourceNotFoundException(primaryKeyErr)).longValue();
		} catch (DataIntegrityViolationException e) {
			logger.error("Trusted device insert exception: {}", e.getMessage());
			throw new BadRequestException("Trusted device details are not added, Contact admin");
		}
	}

	private PreparedStatement setPreparedStatement(TrustedDevice trustedDevice, PreparedStatement ps)
			throws SQLException {
		if (trustedDevice.getLoginUserId() == null) {
			ps.setObject(1, null);
		} else {
			ps.setLong(1, trustedDevice.getLoginUserId());
		}
		ps.setObject(2, trustedDevice.getDeviceCd());
		ps.setObject(3, trustedDevice.getAccessTypeCd());
		ps.setString(4, trustedDevice.getDeviceDescription());
		ps.setString(5, trustedDevice.getDeviceIdentifier());
		ps.setString(6, trustedDevice.getPlatformName());
		ps.setString(7, trustedDevice.getPlatformVersion());
		ps.setString(8, trustedDevice.getClientName());
		ps.setString(9, trustedDevice.getClientVersion());
		ps.setBoolean(10, trustedDevice.isTrusted());
		return ps;
	}

	@Override
	public TrustedDevice findById(Long trustedDeviceId) {
		logger.debug("Finding trusted device by id {}", trustedDeviceId);
		try {
			return jdbcTemplate.queryForObject(getSql(GET), trustedDeviceRowMapper, trustedDeviceId);
		} catch (EmptyResultDataAccessException e) {
			return null;
		}
	}

	@Override
	public TrustedDevice findByDeviceIdentifierAndLoginUserId(String deviceIdentifier, Long loginUserId) {
		logger.debug("Finding trusted device by identifier {} and login user id {}", deviceIdentifier, loginUserId);
		try {
			return jdbcTemplate.queryForObject(getSql(GET_BY_DEVICE_IDENTIFIER_AND_LOGIN_USER_ID),
					trustedDeviceRowMapper, deviceIdentifier, loginUserId);
		} catch (EmptyResultDataAccessException e) {
			return null;
		}
	}

	@Override
	public int updateLastSeen(Long trustedDeviceId) {
		logger.debug("Updating last seen for trusted device id {}", trustedDeviceId);
		return jdbcTemplate.update(getSql(UPDATE_LAST_SEEN), trustedDeviceId);
	}

	@Override
	public List<TrustedDevice> findAllByLoginUserId(Long loginUserId) {
		logger.debug("Finding all trusted devices by login user id {}", loginUserId);
		return jdbcTemplate.query(getSql(LIST_BY_LOGIN_USER_ID), trustedDeviceRowMapper, loginUserId);
	}

	RowMapper<TrustedDevice> trustedDeviceRowMapper = (rs, rowNum) -> {

		TrustedDevice trustedDevice = new TrustedDevice();

		trustedDevice.setTrustedDeviceId(rs.getObject(PK) != null ? rs.getLong(PK) : null);
		trustedDevice.setLoginUserId(rs.getObject("login_user_id") != null ? rs.getLong("login_user_id") : null);
		trustedDevice.setDeviceCd(rs.getObject("device_cd") != null ? rs.getShort("device_cd") : null);
		trustedDevice.setDeviceLocale(rs.getObject("device_locale") != null ? rs.getString("device_locale") : null);
		trustedDevice.setAccessTypeCd(rs.getObject("access_type_cd") != null ? rs.getShort("access_type_cd") : null);
		trustedDevice.setAccessTypeLocale(rs.getObject("access_type_locale") != null ? rs.getString("access_type_locale") : null);
		trustedDevice.setDeviceDescription(
				rs.getObject("device_description") != null ? rs.getString("device_description") : null);
		trustedDevice.setDeviceIdentifier(
				rs.getObject("device_identifier") != null ? rs.getString("device_identifier") : null);
		trustedDevice.setPlatformName(rs.getObject("platform_name") != null ? rs.getString("platform_name") : null);
		trustedDevice
				.setPlatformVersion(rs.getObject("platform_version") != null ? rs.getString("platform_version") : null);
		trustedDevice.setClientName(rs.getObject("client_name") != null ? rs.getString("client_name") : null);
		trustedDevice.setClientVersion(rs.getObject("client_version") != null ? rs.getString("client_version") : null);
		trustedDevice.setTrusted(rs.getObject("trusted") != null ? rs.getBoolean("trusted") : false);
		trustedDevice.setFirstSeenAt(
				rs.getObject("first_seen_at") != null ? rs.getObject("first_seen_at", OffsetDateTime.class) : null);
		trustedDevice.setLastSeenAt(
				rs.getObject("last_seen_at") != null ? rs.getObject("last_seen_at", OffsetDateTime.class) : null);
		trustedDevice.setStartTime(
				rs.getObject("start_time") != null ? rs.getObject("start_time", OffsetDateTime.class) : null);
		trustedDevice
				.setEndTime(rs.getObject("end_time") != null ? rs.getObject("end_time", OffsetDateTime.class) : null);

		return trustedDevice;
	};

}
