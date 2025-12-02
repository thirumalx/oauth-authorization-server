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
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import io.github.thirumalx.exception.BadRequestException;
import io.github.thirumalx.exception.ResourceNotFoundException;
import io.github.thirumalx.model.Mfa;
import io.github.thirumalx.repository.MfaRepository;

/**
 * @author Thirumal
 *
 */
@Repository
public class MfaDao extends GenericDao implements MfaRepository {

	private static final String PK                    = "mfa_id";
	
	private static final String CREATE                = "Mfa.create";
	private static final String GET                   = "Mfa.get";
	private static final String LIST                  = "Mfa.list";
	private static final String LISTBY_LOGIN_USER_ID  = LIST + "ByLoginUserId";
	private static final String DISABLE               = "Mfa.disable";
	
	
	@Override
	public Long save(Mfa mfa) {
		KeyHolder holder = new GeneratedKeyHolder();
        try {
            jdbcTemplate.update(con -> setPreparedStatement(mfa, con.prepareStatement(getSql(CREATE),
                    new String[] { PK })), holder);
            return Optional.ofNullable(holder.getKey())
                    .orElseThrow(()->new ResourceNotFoundException(primaryKeyErr)).longValue();
        } catch (DataIntegrityViolationException e) {
           logger.error("Login user role insert exception: {}", e.getMessage());
           throw new BadRequestException("Password is not added, Contact admin");
        }       
	}
	
	private PreparedStatement setPreparedStatement(Mfa mfa, PreparedStatement ps) throws SQLException {
		if(mfa.getLoginUserId() == null) {
            ps.setObject(1, null);
        } else {
            ps.setLong(1, mfa.getLoginUserId());
        }
		if(mfa.getContactId() == null) {
            ps.setObject(2, null);
        } else {
            ps.setLong(2, mfa.getContactId());
        }
		if(mfa.getMfaCd() == null) {
            ps.setObject(3, null);
        } else {
            ps.setLong(3, mfa.getMfaCd());
        }
		if(mfa.getSecret() == null) {
            ps.setObject(4, null);
        } else {
            ps.setString(4, mfa.getSecret());
        }
		return ps;
	}

	@Override
	public Mfa findById(Long id) {
		logger.debug("Finding MFA by Id {}", id);
		return jdbcTemplate.queryForObject(getSql(GET), mfaRowMapper, id);
	}

	@Override
	public List<Mfa> findByLoginUserId(Long loginUserId) {
		logger.debug("Finding all login user role by login user id {}", loginUserId);
		return jdbcTemplate.query(getSql(LISTBY_LOGIN_USER_ID), mfaRowMapper, loginUserId);
	}

	@Override
	public int disable(Long loginUserId) {
		return jdbcTemplate.update(getSql(DISABLE), loginUserId);
	}
	
	RowMapper<Mfa> mfaRowMapper = (rs, rowNum) -> {

		Mfa mfa = new Mfa();

		mfa.setMfaId(rs.getObject(PK) != null ? rs.getLong(PK) : null);

		mfa.setLoginUserId(rs.getObject("login_user_id") != null ? rs.getLong("login_user_id") : null);
		
		mfa.setContactId(rs.getObject("contact_id") != null ? rs.getLong("contact_id") : null);
		
		mfa.setMfaCd(rs.getObject("mfa_cd") != null ? rs.getLong("mfa_cd") : null);
		
		mfa.setSecret(rs.getObject("secret") != null ? rs.getString("secret") : null);
		
		mfa.setStartTime(rs.getObject("start_time") != null ? rs.getObject("start_time", OffsetDateTime.class) : null);
		
		mfa.setEndTime(rs.getObject("end_time") != null ? rs.getObject("end_time", OffsetDateTime.class) : null);
		
		mfa.setRowCreatedOn(rs.getObject("row_created_on") != null ? rs.getObject("row_created_on", OffsetDateTime.class) : null);
		
		mfa.setRowUpdatedOn(rs.getObject("row_updated_on") != null ? rs.getObject("row_updated_on", OffsetDateTime.class) : null);
		
		mfa.setRowUpdateInfo(rs.getObject("row_update_info") != null ? rs.getString("row_update_info") : null);
		
		return mfa;
	};

}
