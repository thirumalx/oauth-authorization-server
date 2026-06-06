import java.lang.reflect.Constructor;
import org.springframework.security.web.webauthn.api.PublicKeyCredentialParameters;
import org.springframework.security.web.webauthn.api.PublicKeyCredentialType;
import org.springframework.security.web.webauthn.api.COSEAlgorithmIdentifier;

public class InspectMixinDetails {
    public static void main(String[] args) throws Exception {
        COSEAlgorithmIdentifier alg = COSEAlgorithmIdentifier.ES256;
        PublicKeyCredentialType type = PublicKeyCredentialType.PUBLIC_KEY;
        
        // Test 1: with type
        Constructor<PublicKeyCredentialParameters> constructor1 = 
            PublicKeyCredentialParameters.class.getDeclaredConstructor(PublicKeyCredentialType.class, COSEAlgorithmIdentifier.class);
        constructor1.setAccessible(true);
        PublicKeyCredentialParameters params1 = constructor1.newInstance(type, alg);
        System.out.println("Constructor 1 successful! Type: " + params1.getType() + ", Alg: " + params1.getAlg());

        // Test 2: without type
        Constructor<PublicKeyCredentialParameters> constructor2 = 
            PublicKeyCredentialParameters.class.getDeclaredConstructor(COSEAlgorithmIdentifier.class);
        constructor2.setAccessible(true);
        PublicKeyCredentialParameters params2 = constructor2.newInstance(alg);
        System.out.println("Constructor 2 successful! Type: " + params2.getType() + ", Alg: " + params2.getAlg());
    }
}






