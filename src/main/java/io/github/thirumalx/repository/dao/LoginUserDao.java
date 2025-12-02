package io.github.thirumalx.repository.dao;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import io.github.thirumalx.exception.BadRequestException;
import io.github.thirumalx.exception.ResourceNotFoundException;
import io.github.thirumalx.model.LoginUser;
import io.github.thirumalx.model.Pagination;
import io.github.thirumalx.repository.LoginUserRepository;

/**
 * @author Thirumal
 *
 */
@Repository
public class LoginUserDao extends GenericDao implements LoginUserRepository {

	private static final String PK = "login_user_id";
	
	private static final String CREATE     = "LoginUser.create";
	private static final String GET        = "LoginUser.get";
	private static final String GETBY_UUID = GET + "ByUuid"; 
	private static final String LIST       = "LoginUser.list";
	private static final String UPDATE     = "LoginUser.update";
	
	@Override
	public Long save(LoginUser loginUser) {
		KeyHolder holder = new GeneratedKeyHolder();
        try {
            jdbcTemplate.update(con -> setPreparedStatement(loginUser, con.prepareStatement(getSql(CREATE),
                    new String[] { PK })), holder);
            return Optional.ofNullable(holder.getKey())
                    .orElseThrow(()->new ResourceNotFoundException(primaryKeyErr)).longValue();
        } catch (DataIntegrityViolationException e) {
           logger.error("Login user insert exception: {}", e.getMessage());
           throw new BadRequestException("Login user is not added, Contact admin");
        }       
	}

	private PreparedStatement setPreparedStatement(LoginUser loginUser, PreparedStatement ps) throws SQLException {
		ps.setObject(1, UUID.randomUUID());
		ps.setObject(2, loginUser.getDateOfBirth());
		ps.setBoolean(3, loginUser.isIndividual());
		return ps;
	}

	@Override
	public LoginUser findById(Long id) {
		logger.debug("Finding login user by Id {}", id);
		return jdbcTemplate.queryForObject(getSql(GET), loginUserRowMapper, id);
	}

	@Override
	public LoginUser findByUuid(UUID uuid) {
		logger.debug("Finding login user by UUID {}", uuid);
		try {
			return jdbcTemplate.queryForObject(getSql(GETBY_UUID), loginUserRowMapper, uuid);
		} catch (EmptyResultDataAccessException e) {
			return null;
		}
	}
	
	@Override
	public List<LoginUser> findAll(Pagination pagination) {
		logger.debug("Finding all login user with pagination {}", pagination);
		return jdbcTemplate.query(getSql(LIST), loginUserRowMapper, pagination.size(), pagination.getOffset());
	}
	
	@Override
	public long count() {
		Long count = jdbcTemplate.queryForObject(getSql("LoginUser.count"), (ResultSet rs, int rowNum)  -> rs.getLong("count"));
		return count == null ? 0 : count.longValue();
	}
	
	@Override
	public int update(LoginUser loginUser) {
		logger.debug("Updateing login user dob {}", loginUser.getLoginUserId());
		return  jdbcTemplate.update(getSql(UPDATE), loginUser.getDateOfBirth(), loginUser.isIndividual(), loginUser.getLoginUserId());
	}	
	
	RowMapper<LoginUser> loginUserRowMapper = (rs, rowNum) -> {

		LoginUser loginUser = new LoginUser();

		loginUser.setLoginUserId(rs.getObject(PK) != null ? rs.getLong(PK) : null);

		loginUser.setLoginUuid(rs.getObject("login_uuid") != null ? rs.getObject("login_uuid", UUID.class) : null);
		
		loginUser.setDateOfBirth(rs.getObject("date_of_birth") != null ? rs.getObject("date_of_birth", OffsetDateTime.class) : null);
		
		loginUser.setIndividual(rs.getBoolean("individual"));

		loginUser.setRowCreatedOn(rs.getObject("row_created_on") != null ? rs.getObject("row_created_on", OffsetDateTime.class) : null);
 
		return loginUser;
	};

}
