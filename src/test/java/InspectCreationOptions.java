import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.lang.reflect.Field;
import java.lang.annotation.Annotation;

public class InspectCreationOptions {
    public static void main(String[] args) throws Exception {
        Class<?> clazz = Class.forName("org.springframework.security.web.webauthn.api.PublicKeyCredentialCreationOptions");
        System.out.println("Class: " + clazz.getName());
        
        System.out.println("\nConstructors:");
        for (Constructor<?> c : clazz.getDeclaredConstructors()) {
            System.out.println("  " + c.toString());
        }
        
        System.out.println("\nStatic Methods:");
        for (Method m : clazz.getDeclaredMethods()) {
            if (java.lang.reflect.Modifier.isStatic(m.getModifiers())) {
                System.out.println("  " + m.toString());
            }
        }
    }
}
