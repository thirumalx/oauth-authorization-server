import java.lang.reflect.Method;

public class InspectMixinDetails {
    public static void main(String[] args) throws Exception {
        Class<?> configurerClass = Class.forName("org.springframework.security.config.annotation.web.configurers.WebAuthnConfigurer");
        System.out.println("Class: " + configurerClass.getName());
        for (Method m : configurerClass.getDeclaredMethods()) {
            System.out.println("  " + m.getReturnType().getName() + " " + m.getName());
        }
    }
}








