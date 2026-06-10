package io.github.thirumalx.repository;

import java.util.List;
import io.github.thirumalx.model.Address;

/**
 * Repository interface for public.address operations.
 *
 * @author Antigravity
 */
public interface AddressRepository {

    Long save(Address address);

    Address findById(Long id);

    List<Address> findByLoginUserId(Long loginUserId);

    int update(Address address);

    int delete(Long addressId, Long loginUserId);
}
