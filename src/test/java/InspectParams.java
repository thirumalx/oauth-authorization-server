import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;

public class InspectParams {
    public static void main(String[] args) throws Exception {
        Class<?> paramClass = Class.forName("org.springframework.security.web.webauthn.api.PublicKeyCredentialParameters");
        System.out.println("PublicKeyCredentialParameters: IsInterface=" + paramClass.isInterface() + ", Modifiers=" + Modifier.toString(paramClass.getModifiers()));
        for (Constructor<?> c : paramClass.getDeclaredConstructors()) {
            System.out.println("  Constructor: " + c.toString());
        }
        for (Method m : paramClass.getDeclaredMethods()) {
            if (Modifier.isStatic(m.getModifiers())) {
                System.out.println("  Static Method: " + m.toString());
            }
        }
        
        System.out.println();
        Class<?> descClass = Class.forName("org.springframework.security.web.webauthn.api.PublicKeyCredentialDescriptor");
        System.out.println("PublicKeyCredentialDescriptor: IsInterface=" + descClass.isInterface() + ", Modifiers=" + Modifier.toString(descClass.getModifiers()));
        for (Constructor<?> c : descClass.getDeclaredConstructors()) {
            System.out.println("  Constructor: " + c.toString());
        }
    }
}
