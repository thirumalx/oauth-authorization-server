import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;
import org.springframework.security.web.webauthn.jackson.WebauthnJackson2Module;
import org.springframework.security.web.webauthn.api.*;

public class TestJacksonDeserialization {

    // Options class Mixin
    @JsonDeserialize(builder = PublicKeyCredentialCreationOptions.PublicKeyCredentialCreationOptionsBuilder.class)
    public interface PublicKeyCredentialCreationOptionsMixin {
    }

    @JsonPOJOBuilder(buildMethodName = "build", withPrefix = "")
    public interface PublicKeyCredentialCreationOptionsBuilderMixin {
        @JsonIgnore
        PublicKeyCredentialCreationOptions.PublicKeyCredentialCreationOptionsBuilder pubKeyCredParams(
            PublicKeyCredentialParameters[] pubKeyCredParams
        );

        @JsonIgnore
        PublicKeyCredentialCreationOptions.PublicKeyCredentialCreationOptionsBuilder excludeCredentials(
            PublicKeyCredentialDescriptor[] excludeCredentials
        );
    }

    // RpEntity Mixin
    @JsonDeserialize(builder = PublicKeyCredentialRpEntity.PublicKeyCredentialRpEntityBuilder.class)
    public interface PublicKeyCredentialRpEntityMixin {
    }

    @JsonPOJOBuilder(buildMethodName = "build", withPrefix = "")
    public interface PublicKeyCredentialRpEntityBuilderMixin {
    }

    // UserEntity Mixin (Interface maps to Immutable version)
    @JsonDeserialize(as = ImmutablePublicKeyCredentialUserEntity.class)
    public interface PublicKeyCredentialUserEntityMixin {
    }

    @JsonDeserialize(builder = ImmutablePublicKeyCredentialUserEntity.PublicKeyCredentialUserEntityBuilder.class)
    public interface ImmutablePublicKeyCredentialUserEntityMixin {
    }

    @JsonPOJOBuilder(buildMethodName = "build", withPrefix = "")
    public interface ImmutablePublicKeyCredentialUserEntityBuilderMixin {
    }

    public static void main(String[] args) throws Exception {
        String json = "{\n" +
            "  \"rp\": {\n" +
            "    \"name\": \"OAuth Authorization Server\",\n" +
            "    \"id\": \"localhost\"\n" +
            "  },\n" +
            "  \"user\": {\n" +
            "    \"name\": \"testpasskey@gmail.com\",\n" +
            "    \"displayName\": \"testpasskey@gmail.com\",\n" +
            "    \"id\": \"YWJiY2NkZGU=\"\n" + // Base64 for challenge/bytes
            "  },\n" +
            "  \"challenge\": \"MTIzNDU2Nzg5MA==\",\n" +
            "  \"pubKeyCredParams\": [\n" +
            "    {\n" +
            "      \"type\": \"public-key\",\n" +
            "      \"alg\": -7\n" +
            "    }\n" +
            "  ]\n" +
            "}";

        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new WebauthnJackson2Module());
        
        // Register custom mixins
        mapper.addMixIn(PublicKeyCredentialCreationOptions.class, PublicKeyCredentialCreationOptionsMixin.class);
        mapper.addMixIn(PublicKeyCredentialCreationOptions.PublicKeyCredentialCreationOptionsBuilder.class, PublicKeyCredentialCreationOptionsBuilderMixin.class);
        mapper.addMixIn(PublicKeyCredentialRpEntity.class, PublicKeyCredentialRpEntityMixin.class);
        mapper.addMixIn(PublicKeyCredentialRpEntity.PublicKeyCredentialRpEntityBuilder.class, PublicKeyCredentialRpEntityBuilderMixin.class);
        mapper.addMixIn(PublicKeyCredentialUserEntity.class, PublicKeyCredentialUserEntityMixin.class);
        mapper.addMixIn(ImmutablePublicKeyCredentialUserEntity.class, ImmutablePublicKeyCredentialUserEntityMixin.class);
        mapper.addMixIn(ImmutablePublicKeyCredentialUserEntity.PublicKeyCredentialUserEntityBuilder.class, ImmutablePublicKeyCredentialUserEntityBuilderMixin.class);

        try {
            System.out.println("Deserializing...");
            PublicKeyCredentialCreationOptions options = mapper.readValue(json, PublicKeyCredentialCreationOptions.class);
            System.out.println("Deserialized successfully!");
            System.out.println("  RP Name: " + options.getRp().getName());
            System.out.println("  User Name: " + options.getUser().getName());
            System.out.println("  Challenge length: " + options.getChallenge().getBytes().length);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
