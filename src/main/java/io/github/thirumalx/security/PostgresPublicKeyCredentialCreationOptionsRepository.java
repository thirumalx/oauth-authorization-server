package io.github.thirumalx.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.web.webauthn.api.PublicKeyCredentialCreationOptions;
import org.springframework.security.web.webauthn.registration.PublicKeyCredentialCreationOptionsRepository;
import org.springframework.stereotype.Repository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.web.webauthn.jackson.WebauthnJackson2Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * Custom repository that persists WebAuthn PublicKeyCredentialCreationOptions into PostgreSQL,
 * bypassing Spring Session JDBC serialization issues.
 *
 * @author Antigravity
 */
@Repository
public class PostgresPublicKeyCredentialCreationOptionsRepository implements PublicKeyCredentialCreationOptionsRepository {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    // Custom Jackson Mixins for Deserialization Support
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

    @com.fasterxml.jackson.databind.annotation.JsonDeserialize(builder = org.springframework.security.web.webauthn.api.AuthenticatorSelectionCriteria.AuthenticatorSelectionCriteriaBuilder.class)
    private interface AuthenticatorSelectionCriteriaMixin {}

    @com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder(buildMethodName = "build", withPrefix = "")
    private interface AuthenticatorSelectionCriteriaBuilderMixin {}

    public static class AuthenticationExtensionsClientInputsDeserializer extends com.fasterxml.jackson.databind.JsonDeserializer<org.springframework.security.web.webauthn.api.AuthenticationExtensionsClientInputs> {
        @Override
        public org.springframework.security.web.webauthn.api.AuthenticationExtensionsClientInputs deserialize(
                com.fasterxml.jackson.core.JsonParser p, com.fasterxml.jackson.databind.DeserializationContext ctxt)
                throws java.io.IOException {
            com.fasterxml.jackson.core.type.TypeReference<java.util.Map<java.lang.String, java.lang.Object>> typeRef =
                    new com.fasterxml.jackson.core.type.TypeReference<>() {};
            java.util.Map<java.lang.String, java.lang.Object> map = p.readValueAs(typeRef);
            java.util.List<org.springframework.security.web.webauthn.api.AuthenticationExtensionsClientInput> inputs = new java.util.ArrayList<>();
            if (map != null) {
                for (java.util.Map.Entry<java.lang.String, java.lang.Object> entry : map.entrySet()) {
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
                throws java.io.IOException {
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
                throw new java.io.IOException("Failed to instantiate PublicKeyCredentialParameters via reflection", e);
            }
        }
    }

    public PostgresPublicKeyCredentialCreationOptionsRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new WebauthnJackson2Module());
        this.objectMapper.registerModule(new JavaTimeModule());
        
        // Register custom module for AuthenticationExtensionsClientInputs and PublicKeyCredentialParameters deserializers
        com.fasterxml.jackson.databind.module.SimpleModule customModule = new com.fasterxml.jackson.databind.module.SimpleModule();
        customModule.addDeserializer(org.springframework.security.web.webauthn.api.AuthenticationExtensionsClientInputs.class, new AuthenticationExtensionsClientInputsDeserializer());
        customModule.addDeserializer(org.springframework.security.web.webauthn.api.PublicKeyCredentialParameters.class, new PublicKeyCredentialParametersDeserializer());
        this.objectMapper.registerModule(customModule);
        
        // Register custom mixins
        this.objectMapper.addMixIn(org.springframework.security.web.webauthn.api.PublicKeyCredentialCreationOptions.class, PublicKeyCredentialCreationOptionsMixin.class);
        this.objectMapper.addMixIn(org.springframework.security.web.webauthn.api.PublicKeyCredentialCreationOptions.PublicKeyCredentialCreationOptionsBuilder.class, PublicKeyCredentialCreationOptionsBuilderMixin.class);
        this.objectMapper.addMixIn(org.springframework.security.web.webauthn.api.PublicKeyCredentialRpEntity.class, PublicKeyCredentialRpEntityMixin.class);
        this.objectMapper.addMixIn(org.springframework.security.web.webauthn.api.PublicKeyCredentialRpEntity.PublicKeyCredentialRpEntityBuilder.class, PublicKeyCredentialRpEntityBuilderMixin.class);
        this.objectMapper.addMixIn(org.springframework.security.web.webauthn.api.PublicKeyCredentialUserEntity.class, PublicKeyCredentialUserEntityMixin.class);
        this.objectMapper.addMixIn(org.springframework.security.web.webauthn.api.ImmutablePublicKeyCredentialUserEntity.class, ImmutablePublicKeyCredentialUserEntityMixin.class);
        this.objectMapper.addMixIn(org.springframework.security.web.webauthn.api.ImmutablePublicKeyCredentialUserEntity.PublicKeyCredentialUserEntityBuilder.class, ImmutablePublicKeyCredentialUserEntityBuilderMixin.class);
        this.objectMapper.addMixIn(org.springframework.security.web.webauthn.api.PublicKeyCredentialDescriptor.class, PublicKeyCredentialDescriptorMixin.class);
        this.objectMapper.addMixIn(org.springframework.security.web.webauthn.api.PublicKeyCredentialDescriptor.PublicKeyCredentialDescriptorBuilder.class, PublicKeyCredentialDescriptorBuilderMixin.class);
        this.objectMapper.addMixIn(org.springframework.security.web.webauthn.api.AuthenticatorSelectionCriteria.class, AuthenticatorSelectionCriteriaMixin.class);
        this.objectMapper.addMixIn(org.springframework.security.web.webauthn.api.AuthenticatorSelectionCriteria.AuthenticatorSelectionCriteriaBuilder.class, AuthenticatorSelectionCriteriaBuilderMixin.class);
    }

    @Override
    public void save(HttpServletRequest request, HttpServletResponse response, PublicKeyCredentialCreationOptions options) {
        HttpSession session = request.getSession(options != null);
        if (session == null) {
            return;
        }
        String sessionId = session.getId();
        if (options == null) {
            logger.debug("Deleting creation options for session ID: {}", sessionId);
            jdbcTemplate.update("DELETE FROM public.webauthn_creation_options WHERE session_id = ?", sessionId);
        } else {
            try {
                String json = objectMapper.writeValueAsString(options);
                logger.debug("Saving creation options for session ID: {}", sessionId);
                jdbcTemplate.update("DELETE FROM public.webauthn_creation_options WHERE session_id = ?", sessionId);
                jdbcTemplate.update("INSERT INTO public.webauthn_creation_options (session_id, options_json) VALUES (?, ?)", sessionId, json);
            } catch (Exception e) {
                logger.error("Failed to serialize PublicKeyCredentialCreationOptions", e);
                throw new RuntimeException("Failed to serialize PublicKeyCredentialCreationOptions", e);
            }
        }
    }

    @Override
    public PublicKeyCredentialCreationOptions load(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return null;
        }
        String sessionId = session.getId();
        try {
            logger.debug("Loading creation options for session ID: {}", sessionId);
            String json = jdbcTemplate.queryForObject(
                "SELECT options_json FROM public.webauthn_creation_options WHERE session_id = ?",
                String.class,
                sessionId
            );
            if (json == null) {
                return null;
            }
            return objectMapper.readValue(json, PublicKeyCredentialCreationOptions.class);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            logger.debug("No creation options found in DB for session ID: {}", sessionId);
            return null;
        } catch (Exception e) {
            logger.error("Failed to deserialize PublicKeyCredentialCreationOptions", e);
            throw new RuntimeException("Failed to deserialize PublicKeyCredentialCreationOptions", e);
        }
    }
}
