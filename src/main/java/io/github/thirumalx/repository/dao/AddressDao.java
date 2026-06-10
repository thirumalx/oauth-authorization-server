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
import io.github.thirumalx.model.Address;
import io.github.thirumalx.repository.AddressRepository;

/**
 * JDBC Implementation of AddressRepository using Spring templates.
 *
 * @author Antigravity
 */
@Repository
public class AddressDao extends GenericDao implements AddressRepository {

    private static final String PK = "address_id";

    private static final String CREATE = "Address.create";
    private static final String GET = "Address.get";
    private static final String LIST_BY_LOGIN_USER_ID = "Address.listByLoginUserId";
    private static final String UPDATE = "Address.update";
    private static final String DELETE = "Address.delete";

    @Override
    public Long save(Address address) {
        KeyHolder holder = new GeneratedKeyHolder();
        try {
            jdbcTemplate.update(con -> setPreparedStatement(address, con.prepareStatement(getSql(CREATE),
                    new String[] { PK })), holder);
            return Optional.ofNullable(holder.getKey())
                    .orElseThrow(() -> new ResourceNotFoundException(primaryKeyErr)).longValue();
        } catch (DataIntegrityViolationException e) {
            logger.error("Address insert exception: {}", e.getMessage());
            throw new BadRequestException("Address could not be saved. Please verify that lookup values are valid.");
        }
    }

    private PreparedStatement setPreparedStatement(Address address, PreparedStatement ps) throws SQLException {
        if (address.getLoginUserId() == null) {
            ps.setObject(1, null);
        } else {
            ps.setLong(1, address.getLoginUserId());
        }
        
        if (address.getAddressCd() == null) {
            ps.setObject(2, null);
        } else {
            ps.setInt(2, address.getAddressCd());
        }
        
        if (address.getAddressUsageCd() == null) {
            ps.setObject(3, null);
        } else {
            ps.setInt(3, address.getAddressUsageCd());
        }
        
        if (address.getCountryCd() == null) {
            ps.setObject(4, null);
        } else {
            ps.setInt(4, address.getCountryCd());
        }
        
        if (address.getStateCd() == null) {
            ps.setObject(5, null);
        } else {
            ps.setInt(5, address.getStateCd());
        }

        ps.setString(6, address.getAddressLine1());
        ps.setString(7, address.getAddressLine2());
        ps.setString(8, address.getCityTown());
        ps.setString(9, address.getPostalCode());
        ps.setString(10, address.getDistrict());
        
        return ps;
    }

    @Override
    public Address findById(Long id) {
        logger.debug("Finding Address by Id {}", id);
        return jdbcTemplate.queryForObject(getSql(GET), addressRowMapper, id);
    }

    @Override
    public List<Address> findByLoginUserId(Long loginUserId) {
        logger.debug("Finding all Addresses for user {}", loginUserId);
        return jdbcTemplate.query(getSql(LIST_BY_LOGIN_USER_ID), addressRowMapper, loginUserId);
    }

    @Override
    public int update(Address address) {
        logger.debug("Updating Address with ID {}", address.getAddressId());
        return jdbcTemplate.update(getSql(UPDATE),
                address.getAddressCd(),
                address.getAddressUsageCd(),
                address.getCountryCd(),
                address.getStateCd(),
                address.getAddressLine1(),
                address.getAddressLine2(),
                address.getCityTown(),
                address.getPostalCode(),
                address.getDistrict(),
                address.getAddressId(),
                address.getLoginUserId());
    }

    @Override
    public int delete(Long addressId, Long loginUserId) {
        logger.debug("Soft-deleting Address with ID {} for user {}", addressId, loginUserId);
        return jdbcTemplate.update(getSql(DELETE), addressId, loginUserId);
    }

    RowMapper<Address> addressRowMapper = (rs, rowNum) -> {
        Address address = new Address();
        
        address.setAddressId(rs.getObject(PK) != null ? rs.getLong(PK) : null);
        address.setLoginUserId(rs.getObject("login_user_id") != null ? rs.getLong("login_user_id") : null);
        address.setAddressCd(rs.getObject("address_cd") != null ? rs.getInt("address_cd") : null);
        address.setAddressUsageCd(rs.getObject("address_usage_cd") != null ? rs.getInt("address_usage_cd") : null);
        address.setCountryCd(rs.getObject("country_cd") != null ? rs.getInt("country_cd") : null);
        address.setStateCd(rs.getObject("state_cd") != null ? rs.getInt("state_cd") : null);
        address.setAddressLine1(rs.getString("address_line_1"));
        address.setAddressLine2(rs.getString("address_line_2"));
        address.setCityTown(rs.getString("city_town"));
        address.setPostalCode(rs.getString("postal_code"));
        address.setDistrict(rs.getString("district"));
        address.setStartTime(rs.getObject("start_time") != null ? rs.getObject("start_time", OffsetDateTime.class) : null);
        address.setEndTime(rs.getObject("end_time") != null ? rs.getObject("end_time", OffsetDateTime.class) : null);
        address.setRowCreatedOn(rs.getObject("row_created_on") != null ? rs.getObject("row_created_on", OffsetDateTime.class) : null);
        
        // Populate optional metadata if present in SQL join
        try {
            address.setCountryDescription(rs.getString("country_description"));
        } catch (SQLException e) {}
        try {
            address.setStateDescription(rs.getString("state_description"));
        } catch (SQLException e) {}
        try {
            address.setAddressTypeDescription(rs.getString("address_type_description"));
        } catch (SQLException e) {}
        try {
            address.setAddressUsageDescription(rs.getString("address_usage_description"));
        } catch (SQLException e) {}
        
        return address;
    };
}
