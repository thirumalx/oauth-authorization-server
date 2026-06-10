package in.thirumal;

import org.junit.jupiter.api.Test;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.web.webauthn.jackson.WebauthnJackson2Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.security.web.webauthn.api.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

class OauthAuthorizationServerApplicationTests {

	// Custom Jackson Mixins for Deserialization Support (from Creation Options Repository)
	@com.fasterxml.jackson.databind.annotation.JsonDeserialize(builder = org.springframework.security.web.webauthn.api.PublicKeyCredentialCreationOptions.PublicKeyCredentialCreationOptionsBuilder.class)
	private interface PublicKeyCredentialCreationOptionsMixin {}

	@com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder(buildMethodName = "build", withPrefix = "")
	private interface PublicKeyCredentialCreationOptionsBuilderMixin {
		@com.fasterxml.jackson.annotation.JsonIgnore
		org.springframework.security.web.webauthn.api.PublicKeyCredentialCreationOptions.PublicKeyCredentialCreationOptionsBuilder pubKeyCredParams(
			org.springframework.security.web.webauthn.api.PublicKeyCredentialParameters[] pubKeyCredParams
		);

		@com.fasterxml.jackson.annotation.JsonProperty("pubKeyCredParams")
		org.springframework.security.web.webauthn.api.PublicKeyCredentialCreationOptions.PublicKeyCredentialCreationOptionsBuilder pubKeyCredParams(
			java.util.List<org.springframework.security.web.webauthn.api.PublicKeyCredentialParameters> pubKeyCredParams
		);
	}

	@com.fasterxml.jackson.databind.annotation.JsonDeserialize(builder = org.springframework.security.web.webauthn.api.PublicKeyCredentialRpEntity.PublicKeyCredentialRpEntityBuilder.class)
	private interface PublicKeyCredentialRpEntityMixin {}

	@com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder(buildMethodName = "build", withPrefix = "")
	private interface PublicKeyCredentialRpEntityBuilderMixin {}

	@com.fasterxml.jackson.databind.annotation.JsonDeserialize(as = org.springframework.security.web.webauthn.api.ImmutablePublicKeyCredentialUserEntity.class)
	private interface PublicKeyCredentialUserEntityMixin {}

	@com.fasterxml.jackson.databind.annotation.JsonDeserialize(builder = org.springframework.security.web.webauthn.api.ImmutablePublicKeyCredentialUserEntity.PublicKeyCredentialUserEntityBuilder.class)
	private interface ImmutablePublicKeyCredentialUserEntityMixin {}

	@com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder(buildMethodName = "build", withPrefix = "")
	private interface ImmutablePublicKeyCredentialUserEntityBuilderMixin {}

	// Custom Jackson Mixins for Request Options and Descriptor
	@com.fasterxml.jackson.databind.annotation.JsonDeserialize(builder = org.springframework.security.web.webauthn.api.PublicKeyCredentialDescriptor.PublicKeyCredentialDescriptorBuilder.class)
	private interface PublicKeyCredentialDescriptorMixin {}

	@com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder(buildMethodName = "build", withPrefix = "")
	private interface PublicKeyCredentialDescriptorBuilderMixin {
		@com.fasterxml.jackson.annotation.JsonIgnore
		org.springframework.security.web.webauthn.api.PublicKeyCredentialDescriptor.PublicKeyCredentialDescriptorBuilder transports(
			org.springframework.security.web.webauthn.api.AuthenticatorTransport[] transports
		);

		@com.fasterxml.jackson.annotation.JsonProperty("transports")
		org.springframework.security.web.webauthn.api.PublicKeyCredentialDescriptor.PublicKeyCredentialDescriptorBuilder transports(
			java.util.Set<org.springframework.security.web.webauthn.api.AuthenticatorTransport> transports
		);
	}

	@com.fasterxml.jackson.databind.annotation.JsonDeserialize(builder = org.springframework.security.web.webauthn.api.PublicKeyCredentialRequestOptions.PublicKeyCredentialRequestOptionsBuilder.class)
	private interface PublicKeyCredentialRequestOptionsMixin {}

	@com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder(buildMethodName = "build", withPrefix = "")
	private interface PublicKeyCredentialRequestOptionsBuilderMixin {}

	// Custom Jackson Mixins for AuthenticatorSelectionCriteria
	@com.fasterxml.jackson.databind.annotation.JsonDeserialize(builder = org.springframework.security.web.webauthn.api.AuthenticatorSelectionCriteria.AuthenticatorSelectionCriteriaBuilder.class)
	private interface AuthenticatorSelectionCriteriaMixin {}

	@com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder(buildMethodName = "build", withPrefix = "")
	private interface AuthenticatorSelectionCriteriaBuilderMixin {}

	// Custom Jackson Deserializer for AuthenticationExtensionsClientInputs
	public static class AuthenticationExtensionsClientInputsDeserializer extends com.fasterxml.jackson.databind.JsonDeserializer<org.springframework.security.web.webauthn.api.AuthenticationExtensionsClientInputs> {
		@Override
		public org.springframework.security.web.webauthn.api.AuthenticationExtensionsClientInputs deserialize(
				com.fasterxml.jackson.core.JsonParser p, com.fasterxml.jackson.databind.DeserializationContext ctxt)
				throws IOException {
			com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>> typeRef =
					new com.fasterxml.jackson.core.type.TypeReference<>() {};
			Map<String, Object> map = p.readValueAs(typeRef);
			List<org.springframework.security.web.webauthn.api.AuthenticationExtensionsClientInput> inputs = new ArrayList<>();
			if (map != null) {
				for (Map.Entry<String, Object> entry : map.entrySet()) {
					inputs.add(new org.springframework.security.web.webauthn.api.ImmutableAuthenticationExtensionsClientInput<>(entry.getKey(), entry.getValue()));
				}
			}
			return new org.springframework.security.web.webauthn.api.ImmutableAuthenticationExtensionsClientInputs(inputs);
		}
	}

	public static class PublicKeyCredentialParametersDeserializer extends com.fasterxml.jackson.databind.JsonDeserializer<org.springframework.security.web.webauthn.api.PublicKeyCredentialParameters> {
		@Override
		public org.springframework.security.web.webauthn.api.PublicKeyCredentialParameters deserialize(
				com.fasterxml.jackson.core.JsonParser p, com.fasterxml.jackson.databind.DeserializationContext ctxt)
				throws IOException {
			com.fasterxml.jackson.databind.JsonNode node = p.readValueAsTree();
			org.springframework.security.web.webauthn.api.PublicKeyCredentialType type = null;
			if (node.has("type")) {
				type = ctxt.readTreeAsValue(node.get("type"), org.springframework.security.web.webauthn.api.PublicKeyCredentialType.class);
			}
			org.springframework.security.web.webauthn.api.COSEAlgorithmIdentifier alg = null;
			if (node.has("alg")) {
				alg = ctxt.readTreeAsValue(node.get("alg"), org.springframework.security.web.webauthn.api.COSEAlgorithmIdentifier.class);
			}
			try {
				if (type == null) {
					java.lang.reflect.Constructor<org.springframework.security.web.webauthn.api.PublicKeyCredentialParameters> constructor =
						org.springframework.security.web.webauthn.api.PublicKeyCredentialParameters.class.getDeclaredConstructor(
							org.springframework.security.web.webauthn.api.COSEAlgorithmIdentifier.class
						);
					constructor.setAccessible(true);
					return constructor.newInstance(alg);
				} else {
					java.lang.reflect.Constructor<org.springframework.security.web.webauthn.api.PublicKeyCredentialParameters> constructor =
						org.springframework.security.web.webauthn.api.PublicKeyCredentialParameters.class.getDeclaredConstructor(
							org.springframework.security.web.webauthn.api.PublicKeyCredentialType.class,
							org.springframework.security.web.webauthn.api.COSEAlgorithmIdentifier.class
						);
					constructor.setAccessible(true);
					return constructor.newInstance(type, alg);
				}
			} catch (Exception e) {
				throw new IOException("Failed to instantiate PublicKeyCredentialParameters via reflection", e);
			}
		}
	}

	@com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = AuthenticationExtensionsClientInputsDeserializer.class)
	private interface AuthenticationExtensionsClientInputsMixin {}

	@Test
	void contextLoads() throws Exception {
		ObjectMapper mapper = new ObjectMapper();
		mapper.registerModule(new WebauthnJackson2Module());
		mapper.registerModule(new JavaTimeModule());

		// Register custom mixins for creation options
		mapper.addMixIn(org.springframework.security.web.webauthn.api.PublicKeyCredentialCreationOptions.class, PublicKeyCredentialCreationOptionsMixin.class);
		mapper.addMixIn(org.springframework.security.web.webauthn.api.PublicKeyCredentialCreationOptions.PublicKeyCredentialCreationOptionsBuilder.class, PublicKeyCredentialCreationOptionsBuilderMixin.class);
		mapper.addMixIn(org.springframework.security.web.webauthn.api.PublicKeyCredentialRpEntity.class, PublicKeyCredentialRpEntityMixin.class);
		mapper.addMixIn(org.springframework.security.web.webauthn.api.PublicKeyCredentialRpEntity.PublicKeyCredentialRpEntityBuilder.class, PublicKeyCredentialRpEntityBuilderMixin.class);
		mapper.addMixIn(org.springframework.security.web.webauthn.api.PublicKeyCredentialUserEntity.class, PublicKeyCredentialUserEntityMixin.class);
		mapper.addMixIn(org.springframework.security.web.webauthn.api.ImmutablePublicKeyCredentialUserEntity.class, ImmutablePublicKeyCredentialUserEntityMixin.class);
		mapper.addMixIn(org.springframework.security.web.webauthn.api.ImmutablePublicKeyCredentialUserEntity.PublicKeyCredentialUserEntityBuilder.class, ImmutablePublicKeyCredentialUserEntityBuilderMixin.class);

		// Register custom mixins for request options & descriptor
		mapper.addMixIn(PublicKeyCredentialDescriptor.class, PublicKeyCredentialDescriptorMixin.class);
		mapper.addMixIn(PublicKeyCredentialDescriptor.PublicKeyCredentialDescriptorBuilder.class, PublicKeyCredentialDescriptorBuilderMixin.class);
		mapper.addMixIn(PublicKeyCredentialRequestOptions.class, PublicKeyCredentialRequestOptionsMixin.class);
		mapper.addMixIn(PublicKeyCredentialRequestOptions.PublicKeyCredentialRequestOptionsBuilder.class, PublicKeyCredentialRequestOptionsBuilderMixin.class);

		// Register custom mixins for AuthenticatorSelectionCriteria
		mapper.addMixIn(AuthenticatorSelectionCriteria.class, AuthenticatorSelectionCriteriaMixin.class);
		mapper.addMixIn(AuthenticatorSelectionCriteria.AuthenticatorSelectionCriteriaBuilder.class, AuthenticatorSelectionCriteriaBuilderMixin.class);

		// Register custom module for AuthenticationExtensionsClientInputs and PublicKeyCredentialParameters deserializers
		com.fasterxml.jackson.databind.module.SimpleModule customModule = new com.fasterxml.jackson.databind.module.SimpleModule();
		customModule.addDeserializer(AuthenticationExtensionsClientInputs.class, new AuthenticationExtensionsClientInputsDeserializer());
		customModule.addDeserializer(PublicKeyCredentialParameters.class, new PublicKeyCredentialParametersDeserializer());
		mapper.registerModule(customModule);

		// Test the exact user failing payload
		System.out.println("=== Testing Exact User Failing Payload ===");
		String userFailingJson = "{\"rp\":{\"name\":\"OAuth Authorization Server\",\"id\":\"localhost\"}," +
				"\"user\":{\"name\":\"1077e037-3c9e-4b6a-912f-fa39ebf1d7b6\",\"id\":\"pcm7s3nBiCpAp_TOq2ZUWeLsdI6b_WvpYN3UTUHkPeM\",\"displayName\":\"1077e037-3c9e-4b6a-912f-fa39ebf1d7b6\"}," +
				"\"challenge\":\"SfbBBarCuYLXOG62Wr-vjxEryHfQMumHwg-LayF_xCk\"," +
				"\"pubKeyCredParams\":[{\"type\":\"public-key\",\"alg\":-8},{\"type\":\"public-key\",\"alg\":-7},{\"type\":\"public-key\",\"alg\":-257}]," +
				"\"timeout\":300000,\"excludeCredentials\":[]," +
				"\"authenticatorSelection\":{\"residentKey\":\"required\",\"userVerification\":\"preferred\"}," +
				"\"attestation\":\"none\",\"extensions\":{\"credProps\":true}}";
		try {
			PublicKeyCredentialCreationOptions creationOptions = mapper.readValue(userFailingJson, PublicKeyCredentialCreationOptions.class);
			System.out.println("Successfully deserialized exact user creation options payload! Challenge: " + creationOptions.getChallenge().toBase64UrlString());
			System.out.println("Has Extensions: " + (creationOptions.getExtensions() != null));
			if (creationOptions.getExtensions() != null) {
				System.out.println("  Extension count: " + creationOptions.getExtensions().getInputs().size());
				System.out.println("  First Extension ID: " + creationOptions.getExtensions().getInputs().get(0).getExtensionId());
				System.out.println("  First Extension Value: " + creationOptions.getExtensions().getInputs().get(0).getInput());
			}
			
			// Verify serialization back to JSON (which previously threw an exception)
			String serializedJson = mapper.writeValueAsString(creationOptions);
			System.out.println("Successfully serialized creation options back to JSON!");
			System.out.println("Serialized JSON: " + serializedJson);
		} catch (Exception e) {
			System.out.println("Failed to process exact user payload: " + e.getMessage());
			e.printStackTrace();
			throw e;
		}
	}

}
