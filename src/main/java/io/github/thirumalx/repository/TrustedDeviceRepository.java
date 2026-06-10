package io.github.thirumalx.repository;

import java.util.List;

import io.github.thirumalx.model.TrustedDevice;

public interface TrustedDeviceRepository {

	Long save(TrustedDevice trustedDevice);

	TrustedDevice findById(Long trustedDeviceId);
	
	TrustedDevice findByDeviceIdentifierAndLoginUserId(String deviceIdentifier, Long loginUserId);
	
	int updateLastSeen(Long trustedDeviceId);
	
	List<TrustedDevice> findAllByLoginUserId(Long loginUserId);
}
