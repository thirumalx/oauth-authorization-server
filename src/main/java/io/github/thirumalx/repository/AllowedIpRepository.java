package io.github.thirumalx.repository;

import java.util.List;
import io.github.thirumalx.model.AllowedIp;

/**
 * Repository interface for public.allowed_ip data operations.
 *
 * @author Thirumal
 */
public interface AllowedIpRepository {

    Long save(AllowedIp allowedIp);

    AllowedIp findById(Long id);

    List<AllowedIp> findByLoginUserId(Long loginUserId);

    int update(AllowedIp allowedIp);

    int delete(Long allowedIpId, Long loginUserId);
}
