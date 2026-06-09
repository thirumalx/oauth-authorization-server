import java.lang.reflect.Method;
import org.springframework.security.web.webauthn.api.CredentialRecord;

public class TestReflection {
    public static void main(String[] args) {
        Method[] methods = CredentialRecord.class.getMethods();
        for (Method m : methods) {
            if (m.getName().startsWith("get")) {
                System.out.println(m.getName());
            }
        }
    }
}
