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
import io.github.thirumalx.model.AllowedIp;
import io.github.thirumalx.repository.AllowedIpRepository;

/**
 * JDBC Implementation of AllowedIpRepository using Spring templates.
 *
 * @author Thirumal
 */
@Repository
public class AllowedIpDao extends GenericDao implements AllowedIpRepository {

    private static final String PK = "allowed_ip_id";

    private static final String CREATE = "AllowedIp.create";
    private static final String GET = "AllowedIp.get";
    private static final String LIST_BY_LOGIN_USER_ID = "AllowedIp.listByLoginUserId";
    private static final String UPDATE = "AllowedIp.update";
    private static final String DELETE = "AllowedIp.delete";

    @Override
    public Long save(AllowedIp allowedIp) {
        KeyHolder holder = new GeneratedKeyHolder();
        try {
            jdbcTemplate.update(con -> setPreparedStatement(allowedIp, con.prepareStatement(getSql(CREATE),
                    new String[] { PK })), holder);
            return Optional.ofNullable(holder.getKey())
                    .orElseThrow(() -> new ResourceNotFoundException(primaryKeyErr)).longValue();
        } catch (DataIntegrityViolationException e) {
            logger.error("Allowed IP insert exception: {}", e.getMessage());
            throw new BadRequestException("IP range could not be added. Make sure CIDR format is correct.");
        }
    }

    private PreparedStatement setPreparedStatement(AllowedIp allowedIp, PreparedStatement ps) throws SQLException {
        if (allowedIp.getLoginUserId() == null) {
            ps.setObject(1, null);
        } else {
            ps.setLong(1, allowedIp.getLoginUserId());
        }
        ps.setString(2, allowedIp.getId());
        ps.setString(3, allowedIp.getIpRange());
        ps.setObject(4, allowedIp.getStartTime());
        ps.setObject(5, allowedIp.getEndTime());
        return ps;
    }

    @Override
    public AllowedIp findById(Long id) {
        logger.debug("Finding Allowed IP by Id {}", id);
        return jdbcTemplate.queryForObject(getSql(GET), allowedIpRowMapper, id);
    }

    @Override
    public List<AllowedIp> findByLoginUserId(Long loginUserId) {
        logger.debug("Finding all Allowed IPs for user {}", loginUserId);
        return jdbcTemplate.query(getSql(LIST_BY_LOGIN_USER_ID), allowedIpRowMapper, loginUserId);
    }

    @Override
    public int update(AllowedIp allowedIp) {
        logger.debug("Updating Allowed IP with ID {}", allowedIp.getAllowedIpId());
        return jdbcTemplate.update(getSql(UPDATE),
                allowedIp.getId(),
                allowedIp.getIpRange(),
                allowedIp.getStartTime(),
                allowedIp.getEndTime(),
                allowedIp.getAllowedIpId(),
                allowedIp.getLoginUserId());
    }

    @Override
    public int delete(Long allowedIpId, Long loginUserId) {
        logger.debug("Soft-deleting Allowed IP with ID {} for user {}", allowedIpId, loginUserId);
        return jdbcTemplate.update(getSql(DELETE), allowedIpId, loginUserId);
    }

    RowMapper<AllowedIp> allowedIpRowMapper = (rs, rowNum) -> {
        AllowedIp allowedIp = new AllowedIp();
        
        allowedIp.setAllowedIpId(rs.getObject(PK) != null ? rs.getLong(PK) : null);
        allowedIp.setLoginUserId(rs.getObject("login_user_id") != null ? rs.getLong("login_user_id") : null);
        allowedIp.setId(rs.getString("id"));
        allowedIp.setIpRange(rs.getString("ip_range"));
        allowedIp.setStartTime(rs.getObject("start_time") != null ? rs.getObject("start_time", OffsetDateTime.class) : null);
        allowedIp.setEndTime(rs.getObject("end_time") != null ? rs.getObject("end_time", OffsetDateTime.class) : null);
        allowedIp.setCreatedAt(rs.getObject("created_at") != null ? rs.getObject("created_at", OffsetDateTime.class) : null);
        
        // Populate optional metadata if present in SQL join
        try {
            allowedIp.setClientName(rs.getString("client_name"));
            allowedIp.setClientId(rs.getString("client_id"));
        } catch (SQLException e) {
            // metadata not requested in SQL query
        }
        
        return allowedIp;
    };
}
