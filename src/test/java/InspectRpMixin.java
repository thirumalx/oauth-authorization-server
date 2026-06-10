import java.lang.annotation.Annotation;

public class InspectRpMixin {
    public static void main(String[] args) throws Exception {
        Class<?> mixinClass = Class.forName("org.springframework.security.web.webauthn.jackson.PublicKeyCredentialRpEntityMixin");
        System.out.println("Mixin Class: " + mixinClass.getName());
        
        System.out.println("\nAnnotations:");
        for (Annotation ann : mixinClass.getAnnotations()) {
            System.out.println("  " + ann.toString());
        }
    }
}
