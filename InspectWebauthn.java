import java.io.File;
import java.net.URL;
import java.net.URLClassLoader;
import java.lang.reflect.Field;
import java.lang.reflect.Method;

public class InspectWebauthn {
    public static void main(String[] args) throws Exception {
        File jarFile = new File("C:\\Users\\ThirumalM\\.m2\\repository\\org\\springframework\\security\\spring-security-web\\6.5.9\\spring-security-web-6.5.9.jar");
        if (!jarFile.exists()) {
            System.out.println("Jar file does not exist!");
            return;
        }
        URLClassLoader loader = new URLClassLoader(new URL[]{jarFile.toURI().toURL()}, InspectWebauthn.class.getClassLoader());
        
        try {
            Class<?> clazz = Class.forName("org.springframework.security.web.webauthn.registration.WebAuthnRegistrationFilter", false, loader);
            System.out.println("Class: " + clazz.getName());
            System.out.println("\nFields:");
            for (Field field : clazz.getDeclaredFields()) {
                System.out.println("  " + field.getType().getName() + " " + field.getName());
            }
            System.out.println("\nMethods:");
            for (Method method : clazz.getDeclaredMethods()) {
                System.out.println("  " + method.getReturnType().getName() + " " + method.getName() + " (");
                for (Class<?> p : method.getParameterTypes()) {
                    System.out.println("    " + p.getName());
                }
                System.out.println("  )");
            }
        } catch (ClassNotFoundException e) {
            System.out.println("Class not found!");
        }
    }
}
