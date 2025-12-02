/**
 * 
 */
package io.github.thirumalx.repository.dao;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.Optional;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import io.github.thirumalx.exception.BadRequestException;
import io.github.thirumalx.exception.ResourceNotFoundException;
import io.github.thirumalx.model.LoginUserName;
import io.github.thirumalx.repository.LoginUserNameRepository;

/**
 * @author Thirumal
 *
 */
@Repository
public class LoginUserNameDao extends GenericDao implements LoginUserNameRepository {

	private static final String PK = "login_user_name_id";
	
	private static final String CREATE    = "LoginUserName.create";
	private static final String GET      = "LoginUserName.get";
	private static final String GETBY_LOGIN_USER_ID = GET + "ByLoginUserId";
	
	@Override
	public Long save(LoginUserName loginUserName) {
		KeyHolder holder = new GeneratedKeyHolder();
        try {
            jdbcTemplate.update(con -> setPreparedStatement(loginUserName, con.prepareStatement(getSql(CREATE),
                    new String[] { PK })), holder);
            return Optional.ofNullable(holder.getKey())
                    .orElseThrow(()->new ResourceNotFoundException(primaryKeyErr)).longValue();
        } catch (DataIntegrityViolationException e) {
           logger.error("Login user name insert exception: {}", e.getMessage());
           throw new BadRequestException("Login user name is not added, Contact admin");
        }       
	}

	private PreparedStatement setPreparedStatement(LoginUserName loginUserName, PreparedStatement ps) throws SQLException {
		if(loginUserName.getLoginUserId() == null) {
            ps.setObject(1, null);
        } else {
            ps.setLong(1, loginUserName.getLoginUserId());
        }
		if(loginUserName.getFirstName() == null) {
            ps.setObject(2, null);
        } else {
            ps.setString(2, loginUserName.getFirstName().strip());
        }
		if(loginUserName.getMiddleName() == null) {
            ps.setObject(3, null);
        } else {
            ps.setString(3, loginUserName.getMiddleName().strip());
        }
		if(loginUserName.getLastName() == null) {
            ps.setObject(4, null);
        } else {
            ps.setString(4, loginUserName.getLastName().strip());
        }
		return ps;
	}

	@Override
	public LoginUserName findById(Long id) {
		logger.debug("Finding login user name by Id {}", id);
		return jdbcTemplate.queryForObject(getSql(GET), loginUserNameRowMapper, id);
	}

	@Override
	public LoginUserName findByLoginUserId(Long id) {
		logger.debug("Finding login user name by loginUserId {}", id);
		return jdbcTemplate.queryForObject(getSql(GETBY_LOGIN_USER_ID), loginUserNameRowMapper, id);
	}
	
	RowMapper<LoginUserName> loginUserNameRowMapper = (rs, rowNum) -> {

		LoginUserName loginUserName = new LoginUserName();

		loginUserName.setLoginUserNameId(rs.getObject(PK) != null ? rs.getLong(PK) : null);

		loginUserName.setLoginUserId(rs.getObject("login_user_id") != null ? rs.getLong("login_user_id") : null);
		
		loginUserName.setFirstName(rs.getObject("first_name") != null ? rs.getString("first_name") : null);
		
		loginUserName.setMiddleName(rs.getObject("middle_name") != null ? rs.getString("middle_name") : null);
		
		loginUserName.setLastName(rs.getObject("last_name") != null ? rs.getString("last_name") : null);

		loginUserName.setRowCreatedOn(rs.getObject("row_created_on") != null ? rs.getObject("row_created_on", OffsetDateTime.class) : null);
 
		return loginUserName;
	};

}
