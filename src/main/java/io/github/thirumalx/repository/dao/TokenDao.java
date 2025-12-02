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
import io.github.thirumalx.model.Token;
import io.github.thirumalx.repository.TokenRepository;

/**
 * @author Thirumal
 *
 */
@Repository
public class TokenDao extends GenericDao implements TokenRepository {

	private static final String PK                   = "token_id";
	
	private static final String CREATE               = "Token.create";
	private static final String GET                  = "Token.get";
	private static final String LIST                 = "Token.list";
	private static final String GET_BY_CONTACT_ID  = GET + "ByContactId";
	private static final String LIST_BY_CONTACT_ID = LIST + "ByContactId";
	
	@Override
	public Long save(Token token) {
		KeyHolder holder = new GeneratedKeyHolder();
        try {
            jdbcTemplate.update(con -> setPreparedStatement(token, con.prepareStatement(getSql(CREATE),
                    new String[] { PK })), holder);
            return Optional.ofNullable(holder.getKey())
                    .orElseThrow(()->new ResourceNotFoundException(primaryKeyErr)).longValue();
        } catch (DataIntegrityViolationException e) {
           logger.error("Login user name insert exception: {}", e.getMessage());
           throw new BadRequestException("Login user name is not added, Contact admin");
        }       
	}

	private PreparedStatement setPreparedStatement(Token token, PreparedStatement ps) throws SQLException {
		if(token.getContactId() == null) {
            ps.setObject(1, null);
        } else {
            ps.setLong(1, token.getContactId());
        }
		if(token.getOtp() == null) {
            ps.setObject(2, null);
        } else {
            ps.setString(2, token.getOtp());
        }
		if(token.getExpiresOn() == null) {
            ps.setObject(3, null);
        } else {
            ps.setObject(3, token.getExpiresOn());
        }
		return ps;
	}

	@Override
	public Token findById(Long id) {
		logger.debug("Finding token by Id {}", id);
		return jdbcTemplate.queryForObject(getSql(GET), tokenRowMapper, id);
	}

	@Override
	public Token findByContactId(Long contactId) {
		logger.debug("Finding token by contact Id {}", contactId);
		try {
			return jdbcTemplate.queryForObject(getSql(GET_BY_CONTACT_ID), tokenRowMapper, contactId);
		} catch(EmptyResultDataAccessException e) {
			return null;
		}
	}
	
	@Override
	public List<Token> findAllByContactId(Long id) {
		logger.debug("Finding tokens by contact {}", id);
		return jdbcTemplate.query(getSql(LIST_BY_CONTACT_ID), tokenRowMapper, id);
	}

	RowMapper<Token> tokenRowMapper = (rs, rowNum) -> {

		Token token = new Token();

		token.setTokenId(rs.getObject(PK) != null ? rs.getLong(PK) : null);

		token.setContactId(rs.getObject("contact_id") != null ? rs.getLong("contact_id") : null);
		
		token.setOtp(rs.getObject("otp") != null ? rs.getString("otp") : null);

		token.setExpiresOn(rs.getObject("expires_on") != null ? rs.getObject("expires_on", OffsetDateTime.class) : null);
		
		token.setRowCreatedOn(rs.getObject("row_created_on") != null ? rs.getObject("row_created_on", OffsetDateTime.class) : null);
 
		return token;
	};

}
