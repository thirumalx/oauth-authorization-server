/**
 * 
 */
package io.github.thirumalx.repository.dao;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import io.github.thirumalx.exception.BadRequestException;
import io.github.thirumalx.exception.ResourceNotFoundException;
import io.github.thirumalx.model.Contact;
import io.github.thirumalx.repository.ContactRepository;

/**
 * @author Thirumal
 *
 */
@Repository
public class ContactDao extends GenericDao implements ContactRepository {

	private static final String PK                   = "contact_id";
	
	private static final String CREATE               = "Contact.create";
	private static final String GET                  = "Contact.get";
	private static final String LIST                 = "Contact.list";
	private static final String GETBY_LOGIN_USER_ID  = GET + "ByLoginUserId";
	private static final String LISTBY_LOGIN_ID      = LIST + "ByLoginId";
	private static final String LIST_IN_LOGIN_ID      = LIST + "InLoginId";
	private static final String LISTBY_LOGIN_USER_ID = LIST + "ByLoginUserId";
	
	@Override
	public Long save(Contact contact) {
		KeyHolder holder = new GeneratedKeyHolder();
        try {
            jdbcTemplate.update(con -> setPreparedStatement(contact, con.prepareStatement(getSql(CREATE),
                    new String[] { PK })), holder);
            return Optional.ofNullable(holder.getKey())
                    .orElseThrow(()->new ResourceNotFoundException(primaryKeyErr)).longValue();
        } catch (DataIntegrityViolationException e) {
           logger.error("Login user name insert exception: {}", e.getMessage());
           throw new BadRequestException("Login user name is not added, Contact admin");
        }       
	}

	private PreparedStatement setPreparedStatement(Contact contact, PreparedStatement ps) throws SQLException {
		if(contact.getLoginUserId() == null) {
            ps.setObject(1, null);
        } else {
            ps.setLong(1, contact.getLoginUserId());
        }
		if(contact.getContactCd() == null) {
            ps.setObject(2, null);
        } else {
            ps.setLong(2, contact.getContactCd());
        }
		if(contact.getLoginId() == null) {
            ps.setObject(3, null);
        } else {
            ps.setString(3, contact.getLoginId().strip().toLowerCase());
        }
		return ps;
	}
	
	@Override
	public int[] saveAll(List<Contact> contacts) {
		try {
			return jdbcTemplate.batchUpdate(getSql(CREATE), new BatchPreparedStatementSetter() {
				@Override
				public void setValues(PreparedStatement ps, int i) throws SQLException {
					setPreparedStatement(contacts.get(i), ps);
				}
				@Override
				public int getBatchSize() {
					return contacts.size();
				}
			});
		} catch (DataIntegrityViolationException e) {
			logger.debug("Exception during batch insertion of contact {}", e.getMessage());
		}
		throw new BadRequestException("Contact batch insert is failed");		
	}

	@Override
	public Contact findById(Long id) {
		logger.debug("Finding contact by Id {}", id);
		return jdbcTemplate.queryForObject(getSql(GET), contactRowMapper, id);
	}

	@Override
	public Contact findByLoginUserId(Long id) {
		logger.debug("Finding contact by loginUserId {}", id);
		return jdbcTemplate.queryForObject(getSql(GETBY_LOGIN_USER_ID), contactRowMapper, id);
	}

	@Override
	public List<Contact> findAllByLoginUserId(Long id) {
		logger.debug("Finding contact by loginUserId {}", id);
		return jdbcTemplate.query(getSql(LISTBY_LOGIN_USER_ID), contactRowMapper, id);
	}
	
	/**
	 * Retrieve active login by @param loginId
	 * return {@link Contact }
	 */
	@Override
	public Contact findActiveLoginIdByLoginId(String loginId) {
		logger.debug("Finding contact by loginId {}", loginId);
		try {
			return jdbcTemplate.queryForObject(getSql(LISTBY_LOGIN_ID), contactRowMapper, loginId);
		} catch (EmptyResultDataAccessException e) {
			return null;
		}
	}
	
	@Override
	public List<Contact> findByLoginId(Set<String> loginIds) {
		String sql = getSql(LIST_IN_LOGIN_ID);
		return jdbcTemplate.query(setInvalues(sql, "?", loginIds), contactRowMapper);
	}
	
	@Override
	public int verify(Long contactId) {
		return jdbcTemplate.update(getSql("Contact.verify"), contactId);
	}	
	
	RowMapper<Contact> contactRowMapper = (rs, rowNum) -> {

		Contact contact = new Contact();

		contact.setContactId(rs.getObject(PK) != null ? rs.getLong(PK) : null);

		contact.setLoginUserId(rs.getObject("login_user_id") != null ? rs.getLong("login_user_id") : null);
		
		contact.setContactCd(rs.getObject("contact_cd") != null ? rs.getLong("contact_cd") : null);
		
		contact.setLoginId(rs.getObject("login_id") != null ? rs.getString("login_id") : null);
		
		contact.setVerifiedOn(rs.getObject("verified_on") != null ? rs.getObject("verified_on", OffsetDateTime.class) : null);
		
		contact.setEndTime(rs.getObject("end_time") != null ? rs.getObject("end_time", OffsetDateTime.class) : null);

		contact.setRowCreatedOn(rs.getObject("row_created_on") != null ? rs.getObject("row_created_on", OffsetDateTime.class) : null);
 
		return contact;
	};

	
}
