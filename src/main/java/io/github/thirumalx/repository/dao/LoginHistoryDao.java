/**
 * 
 */
package io.github.thirumalx.repository.dao;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import io.github.thirumalx.exception.BadRequestException;
import io.github.thirumalx.exception.ResourceNotFoundException;
import io.github.thirumalx.model.LoginHistory;
import io.github.thirumalx.repository.LoginHistoryRepository;

/**
 * @author Thirumal
 *
 */
@Repository
public class LoginHistoryDao extends GenericDao implements LoginHistoryRepository {

	private static final String PK                   = "login_history_id";
	
	private static final String CREATE               = "LoginHistory.create";
	private static final String LIST                 = "LoginHistory.list";
	private static final String LISTBY_LOGIN_USER_ID = LIST + "ByLoginUserId";
	private static final String LAST_N_LOGIN_FAILED  = "LoginHistory.lastNFailedLogin";
	
	@Override
	public Long save(LoginHistory loginHistory) {
		KeyHolder holder = new GeneratedKeyHolder();
        try {
            jdbcTemplate.update(con -> setPreparedStatement(loginHistory, con.prepareStatement(getSql(CREATE),
                    new String[] { PK })), holder);
            return Optional.ofNullable(holder.getKey())
                    .orElseThrow(()->new ResourceNotFoundException(primaryKeyErr)).longValue();
        } catch (DataIntegrityViolationException e) {
           logger.error("Login histories insert exception: {}", e.getMessage());
           throw new BadRequestException("Login details are not added, Contact admin");
        }       
	}

	private PreparedStatement setPreparedStatement(LoginHistory loginHistory, PreparedStatement ps) throws SQLException {
		if(loginHistory.getLoginUserId() == null) {
            ps.setObject(1, null);
        } else {
            ps.setLong(1, loginHistory.getLoginUserId());
        }
		ps.setBoolean(2, loginHistory.isSuccessLogin());		 
		return ps;
	}
	
	@Override
	public int saveLogout(Long loginUserId) {
		return jdbcTemplate.update(getSql("LoginHistory.logout"), loginUserId);
	}

	@Override
	public List<LoginHistory> list(Long loginUserId, int limit, int offset) {
		logger.debug("Finding all password by login user id {}", loginUserId);
		return jdbcTemplate.query(getSql(LISTBY_LOGIN_USER_ID), loginHistoryRowMapper, loginUserId, limit, offset);
	}
	
	@Override
	public long count(Long loginUserId) {
		Long count = jdbcTemplate.queryForObject(getSql("LoginHistory.count"), (ResultSet rs, int rowNum)  -> rs.getLong("count"), loginUserId);
		return count == null ? 0 : count.longValue();
	}
	
	@Override
	public boolean isLastNLoginFailed(Long loginUserId, int lastNLogin) {
		 Long failedCount = jdbcTemplate.queryForObject(getSql(LAST_N_LOGIN_FAILED), 
				 (ResultSet rs, int rowNum)  -> rs.getLong("count"), loginUserId, lastNLogin);
		 return failedCount != null && failedCount >= lastNLogin;
	}

	RowMapper<LoginHistory> loginHistoryRowMapper = (rs, rowNum) -> {

		LoginHistory loginHistory = new LoginHistory();

		loginHistory.setLoginHistoryId(rs.getObject(PK) != null ? rs.getLong(PK) : null);

		loginHistory.setLoginUserId(rs.getObject("login_user_id") != null ? rs.getLong("login_user_id") : null);
		
		loginHistory.setSuccessLogin((rs.getObject("success_login") != null ? rs.getBoolean("success_login") : null));
		
		loginHistory.setRowCreatedOn(rs.getObject("row_created_on") != null ? rs.getObject("row_created_on", OffsetDateTime.class) : null);
		
		loginHistory.setLogoutTime(rs.getObject("logout_time") != null ? rs.getObject("logout_time", OffsetDateTime.class) : null);
 
		return loginHistory;
	};

}
