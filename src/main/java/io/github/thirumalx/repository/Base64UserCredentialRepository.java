package io.github.thirumalx.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.Base64;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.web.webauthn.api.AuthenticatorTransport;
import org.springframework.security.web.webauthn.api.Bytes;
import org.springframework.security.web.webauthn.api.CredentialRecord;
import org.springframework.security.web.webauthn.api.ImmutableCredentialRecord;
import org.springframework.security.web.webauthn.api.PublicKeyCose;
import org.springframework.security.web.webauthn.management.UserCredentialRepository;

public class Base64UserCredentialRepository implements UserCredentialRepository {

	private final JdbcOperations jdbcOperations;

	private static final String INSERT_SQL = "INSERT INTO user_credentials "
			+ "(id, user_entity_user_id, credential_id, public_key, signature_count, backup_state, uv_initialized, authenticator_transports, attestation_object, attestation_client_data_json, public_key_credential_type, created, last_used, backup_eligible, label) "
			+ "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

	private static final String FIND_BY_CREDENTIAL_ID_SQL = "SELECT "
			+ "user_entity_user_id, credential_id, public_key, signature_count, backup_state, uv_initialized, authenticator_transports, attestation_object, attestation_client_data_json, label, created, last_used "
			+ "FROM user_credentials WHERE credential_id = ?";

	private static final String FIND_BY_USER_ID_SQL = "SELECT "
			+ "user_entity_user_id, credential_id, public_key, signature_count, backup_state, uv_initialized, authenticator_transports, attestation_object, attestation_client_data_json, label, created, last_used "
			+ "FROM user_credentials WHERE user_entity_user_id = ?";

	private static final String DELETE_SQL = "DELETE FROM user_credentials WHERE credential_id = ?";

	public Base64UserCredentialRepository(JdbcOperations jdbcOperations) {
		this.jdbcOperations = jdbcOperations;
	}

	@Override
	public void save(CredentialRecord credentialRecord) {
		System.out.println("====== BASE64 REPO SAVING CREDENTIAL ======");
		System.out.println("User Entity ID: " + credentialRecord.getUserEntityUserId());

		if (findByCredentialId(credentialRecord.getCredentialId()) != null) {
			System.out.println("====== EXECUTING UPDATE ON user_credentials ======");
			String credentialId = Base64.getUrlEncoder().withoutPadding().encodeToString(credentialRecord.getCredentialId().getBytes());
			java.sql.Timestamp lastUsed = credentialRecord.getLastUsed() != null ? java.sql.Timestamp.from(credentialRecord.getLastUsed()) : new java.sql.Timestamp(System.currentTimeMillis());
			try {
				int rows = jdbcOperations.update("UPDATE user_credentials SET signature_count = ?, backup_state = ?, uv_initialized = ?, last_used = ? WHERE credential_id = ?",
						credentialRecord.getSignatureCount(),
						credentialRecord.isBackupState(),
						credentialRecord.isUvInitialized(),
						lastUsed,
						credentialId);
				System.out.println("====== UPDATE SUCCESSFUL, ROWS AFFECTED: " + rows + " ======");
			} catch (Exception e) {
				System.err.println("====== ERROR UPDATING CREDENTIAL ======");
				e.printStackTrace();
				throw e;
			}
			return;
		}

		String userEntityId = Base64.getUrlEncoder().withoutPadding().encodeToString(credentialRecord.getUserEntityUserId().getBytes());
		String credentialId = Base64.getUrlEncoder().withoutPadding().encodeToString(credentialRecord.getCredentialId().getBytes());
		String publicKey = Base64.getUrlEncoder().withoutPadding().encodeToString(credentialRecord.getPublicKey().getBytes());
		
		String transports = null;
		if (credentialRecord.getTransports() != null) {
			transports = credentialRecord.getTransports().stream()
					.map(AuthenticatorTransport::getValue)
					.collect(Collectors.joining(","));
		}

		byte[] attestationObject = credentialRecord.getAttestationObject() != null ? credentialRecord.getAttestationObject().getBytes() : null;
		byte[] clientDataJson = credentialRecord.getAttestationClientDataJSON() != null ? credentialRecord.getAttestationClientDataJSON().getBytes() : null;

		java.sql.Timestamp created = credentialRecord.getCreated() != null ? java.sql.Timestamp.from(credentialRecord.getCreated()) : new java.sql.Timestamp(System.currentTimeMillis());
		java.sql.Timestamp lastUsed = credentialRecord.getLastUsed() != null ? java.sql.Timestamp.from(credentialRecord.getLastUsed()) : created;
		String id = java.util.UUID.randomUUID().toString();

		System.out.println("====== EXECUTING INSERT INTO user_credentials ======");
		try {
			int rows = jdbcOperations.update(INSERT_SQL,
					id,
					userEntityId,
					credentialId,
					publicKey,
					credentialRecord.getSignatureCount(),
					credentialRecord.isBackupState(),
					credentialRecord.isUvInitialized(),
					transports,
					attestationObject,
					clientDataJson,
					credentialRecord.getCredentialType().getValue(),
					created,
					lastUsed,
					credentialRecord.isBackupEligible(),
					credentialRecord.getLabel()
			);
			System.out.println("====== INSERT SUCCESSFUL, ROWS AFFECTED: " + rows + " ======");
		} catch (Exception e) {
			System.err.println("====== ERROR INSERTING CREDENTIAL ======");
			e.printStackTrace();
			throw e;
		}
	}

	@Override
	public void delete(Bytes credentialId) {
		String encodedCredentialId = Base64.getUrlEncoder().withoutPadding().encodeToString(credentialId.getBytes());
		jdbcOperations.update(DELETE_SQL, encodedCredentialId);
	}

	@Override
	public CredentialRecord findByCredentialId(Bytes credentialId) {
		String encodedCredentialId = Base64.getUrlEncoder().withoutPadding().encodeToString(credentialId.getBytes());
		List<CredentialRecord> records = jdbcOperations.query(FIND_BY_CREDENTIAL_ID_SQL, new CredentialRecordRowMapper(), encodedCredentialId);
		if (records.isEmpty()) {
			return null;
		}
		return records.get(0);
	}

	@Override
	public List<CredentialRecord> findByUserId(Bytes userId) {
		String encodedUserId = Base64.getUrlEncoder().withoutPadding().encodeToString(userId.getBytes());
		return jdbcOperations.query(FIND_BY_USER_ID_SQL, new CredentialRecordRowMapper(), encodedUserId);
	}

	private static class CredentialRecordRowMapper implements RowMapper<CredentialRecord> {
		@Override
		public CredentialRecord mapRow(ResultSet rs, int rowNum) throws SQLException {
			String userEntityIdStr = rs.getString("user_entity_user_id");
			Bytes userEntityId = new Bytes(Base64.getUrlDecoder().decode(userEntityIdStr));

			String credentialIdStr = rs.getString("credential_id");
			Bytes credentialId = new Bytes(Base64.getUrlDecoder().decode(credentialIdStr));

			String publicKeyStr = rs.getString("public_key");
			// In Spring Security 6.2+, PublicKeyCose is an interface, but we can provide Bytes, or we can use the default implementation or we just pass Bytes to the builder directly
			// Wait, in older Spring Security PublicKeyCose had a byte[] constructor. 
			// Let's use new PublicKeyCose(bytes) if possible? No, compilation said "PublicKeyCose is abstract; cannot be instantiated".
			// So we just pass the byte array to the publicKey method in builder? Wait, ImmutableCredentialRecordBuilder has a publicKey(PublicKeyCose) method. 
			// But since PublicKeyCose is abstract, what implementation to use?
			// Maybe there is a method to create it or maybe the builder accepts Bytes or byte[]?
			// Let's use `new PublicKeyCose(...)`? No, abstract.
			// Let's look up how to create PublicKeyCose. It might be `org.springframework.security.web.webauthn.api.PublicKeyCose`.
			// Spring Security docs say `PublicKeyCose` is an interface. We might not need to implement it.
			// Actually, ImmutableCredentialRecordBuilder accepts `publicKeyCose` which is just an interface. We can use an anonymous class or see if there is a factory method.
			// Is there a factory method like `PublicKeyCose.of(...)`? Let's check or just make an anonymous class!
			PublicKeyCose publicKey = new PublicKeyCose() {
				@Override
				public byte[] getBytes() {
					return Base64.getUrlDecoder().decode(publicKeyStr);
				}
			};

			long signatureCount = rs.getLong("signature_count");
			boolean backupState = rs.getBoolean("backup_state");
			boolean uvInitialized = rs.getBoolean("uv_initialized");

			String transportsStr = rs.getString("authenticator_transports");
			Set<org.springframework.security.web.webauthn.api.AuthenticatorTransport> transports = transportsStr != null 
				? Arrays.stream(transportsStr.split(","))
					.map(s -> org.springframework.security.web.webauthn.api.AuthenticatorTransport.valueOf(s.toUpperCase()))
					.collect(Collectors.toSet())
				: null;

			byte[] attestationObjectBytes = rs.getBytes("attestation_object");
			Bytes attestationObject = attestationObjectBytes != null ? new Bytes(attestationObjectBytes) : null;

			byte[] clientDataJsonBytes = rs.getBytes("attestation_client_data_json");
			Bytes clientDataJson = clientDataJsonBytes != null ? new Bytes(clientDataJsonBytes) : null;

			String label = rs.getString("label");
			java.sql.Timestamp createdTimestamp = rs.getTimestamp("created");
			java.time.Instant created = createdTimestamp != null ? createdTimestamp.toInstant() : java.time.Instant.now();
			java.sql.Timestamp lastUsedTimestamp = rs.getTimestamp("last_used");
			java.time.Instant lastUsed = lastUsedTimestamp != null ? lastUsedTimestamp.toInstant() : created;

			return ImmutableCredentialRecord.builder()
					.userEntityUserId(userEntityId)
					.credentialId(credentialId)
					.publicKey(publicKey)
					.signatureCount(signatureCount)
					.backupState(backupState)
					.uvInitialized(uvInitialized)
					.transports(transports)
					.attestationObject(attestationObject)
					.attestationClientDataJSON(clientDataJson)
					.label(label)
					.credentialType(org.springframework.security.web.webauthn.api.PublicKeyCredentialType.PUBLIC_KEY)
					.backupEligible(true)
					.created(created)
					.lastUsed(lastUsed)
					.build();
		}
	}
}
