/**
 * 
 */
package io.github.thirumalx.repository.dao;

import java.sql.PreparedStatement;
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
import io.github.thirumalx.model.Password;
import io.github.thirumalx.repository.PasswordRepository;

/**
 * @author Thirumal
 *
 */
@Repository
public class PasswordDao extends GenericDao implements PasswordRepository {

	private static final String PK = "password_id";
	
	private static final String CREATE    = "Password.create";
	private static final String GET      = "Password.get";
	private static final String LIST      = "Password.list";
	private static final String GETBY_LOGIN_USER_ID = GET + "ByLoginUserId";
	private static final String LISTBY_LOGIN_USER_ID = LIST + "ByLoginUserId";
	private static final String LIST_LAST_N_ROW_BY_LOGIN_USER_ID = LIST + "LastNRowByLoginUserId";
	private static final String PASSWORD_RESET_AFTER_N_LOGIN_ATTEMPT = "Password.PasswordResetAfterNLoginAttempt";
	
	
	@Override
	public Long save(Password password) {
		KeyHolder holder = new GeneratedKeyHolder();
        try {
            jdbcTemplate.update(con -> setPreparedStatement(password, con.prepareStatement(getSql(CREATE),
                    new String[] { PK })), holder);
            return Optional.ofNullable(holder.getKey())
                    .orElseThrow(()->new ResourceNotFoundException(primaryKeyErr)).longValue();
        } catch (DataIntegrityViolationException e) {
           logger.error("Password insert exception: {}", e.getMessage());
           throw new BadRequestException("Password is not added, Contact admin");
        }       
	}
	
	private PreparedStatement setPreparedStatement(Password password, PreparedStatement ps) throws SQLException {
		if(password.getLoginUserId() == null) {
            ps.setObject(1, null);
        } else {
            ps.setLong(1, password.getLoginUserId());
        }
		if(password.getSecretKey() == null) {
            ps.setObject(2, null);
        } else {
            ps.setString(2, password.getSecretKey());
        }
		ps.setBoolean(3, password.isForcePasswordChange());
		return ps;
	}

	@Override
	public Password findById(Long id) {
		logger.debug("Finding password by Id {}", id);
		return jdbcTemplate.queryForObject(getSql(GET), passwordRowMapper, id);
	}

	@Override
	public Password findByLoginUserId(Long loginUserId) {
		logger.debug("Finding password by login user id {}", loginUserId);
		try {
			return jdbcTemplate.queryForObject(getSql(GETBY_LOGIN_USER_ID), passwordRowMapper, loginUserId);
		} catch (EmptyResultDataAccessException e) {
			return null;
		}
	}

	@Override
	public List<Password> findAllByLoginUserId(Long loginUserId) {
		logger.debug("Finding all password by login user id {}", loginUserId);
		return jdbcTemplate.query(getSql(LISTBY_LOGIN_USER_ID), passwordRowMapper, loginUserId);
	}
	

	@Override
	public List<Password> findAllByLastNRowLoginUserId(Long loginUserId, int lastNRow) {
		logger.debug("Finding all password by login user id {} with limit {}", loginUserId, lastNRow);
		return jdbcTemplate.query(getSql(LIST_LAST_N_ROW_BY_LOGIN_USER_ID), passwordRowMapper, loginUserId, lastNRow);
	}

	@Override
	public boolean isPasswordResetAfterNLoginAttempt(Long loginUserId, int loginAttempt) {
		logger.debug("Is user {} reset the password after {} login attempt", loginUserId, loginAttempt);
		return !jdbcTemplate.query(getSql(PASSWORD_RESET_AFTER_N_LOGIN_ATTEMPT), passwordRowMapper, 
				loginUserId, loginUserId, loginUserId, loginAttempt).isEmpty();
	}
	
	RowMapper<Password> passwordRowMapper = (rs, rowNum) -> {

		Password password = new Password();

		password.setPasswordId(rs.getObject(PK) != null ? rs.getLong(PK) : null);

		password.setLoginUserId(rs.getObject("login_user_id") != null ? rs.getLong("login_user_id") : null);
		
		password.setSecretKey(rs.getObject("secret_key") != null ? rs.getString("secret_key") : null);
		
		password.setForcePasswordChange(rs.getObject("force_password_change") != null ? rs.getBoolean("force_password_change") : null);

		password.setRowCreatedOn(rs.getObject("row_created_on") != null ? rs.getObject("row_created_on", OffsetDateTime.class) : null);
 
		return password;
	};


}
