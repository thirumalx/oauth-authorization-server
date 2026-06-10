import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;

public class InspectRpEntity {
    public static void main(String[] args) throws Exception {
        Class<?> rpClass = Class.forName("org.springframework.security.web.webauthn.api.PublicKeyCredentialRpEntity");
        System.out.println("PublicKeyCredentialRpEntity: IsInterface=" + rpClass.isInterface() + ", Modifiers=" + Modifier.toString(rpClass.getModifiers()));
        for (Constructor<?> c : rpClass.getDeclaredConstructors()) {
            System.out.println("  Constructor: " + c.toString());
        }
        for (Method m : rpClass.getDeclaredMethods()) {
            if (Modifier.isStatic(m.getModifiers())) {
                System.out.println("  Static Method: " + m.toString());
            }
        }
        
        System.out.println();
        Class<?> userClass = Class.forName("org.springframework.security.web.webauthn.api.PublicKeyCredentialUserEntity");
        System.out.println("PublicKeyCredentialUserEntity: IsInterface=" + userClass.isInterface() + ", Modifiers=" + Modifier.toString(userClass.getModifiers()));
        for (Constructor<?> c : userClass.getDeclaredConstructors()) {
            System.out.println("  Constructor: " + c.toString());
        }
        for (Method m : userClass.getDeclaredMethods()) {
            if (Modifier.isStatic(m.getModifiers())) {
                System.out.println("  Static Method: " + m.toString());
            }
        }
    }
}
