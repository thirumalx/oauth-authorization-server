import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.web.webauthn.jackson.WebauthnJackson2Module;
import java.lang.reflect.Field;
import java.util.Map;

public class InspectJacksonModule {
    public static void main(String[] args) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new WebauthnJackson2Module());
        
        System.out.println("Config class: " + mapper.getDeserializationConfig().getClass().getName());
        
        // Find fields in DeserializationConfig or its superclasses
        Class<?> configClass = mapper.getDeserializationConfig().getClass();
        Field mixInsField = null;
        while (configClass != null) {
            try {
                mixInsField = configClass.getDeclaredField("_mixIns");
                break;
            } catch (NoSuchFieldException e) {
                configClass = configClass.getSuperclass();
            }
        }
        
        if (mixInsField != null) {
            mixInsField.setAccessible(true);
            Object mixInsObj = mixInsField.get(mapper.getDeserializationConfig());
            System.out.println("MixIn Resolver Class: " + mixInsObj.getClass().getName());
            
            // In SimpleMixInResolver, _localMixIns holds the mapping
            Field localMixInsField = mixInsObj.getClass().getDeclaredField("_localMixIns");
            localMixInsField.setAccessible(true);
            Map<?, ?> localMixIns = (Map<?, ?>) localMixInsField.get(mixInsObj);
            if (localMixIns != null) {
                for (Map.Entry<?, ?> entry : localMixIns.entrySet()) {
                    System.out.println("  Class: " + entry.getKey().toString() + " -> MixIn: " + entry.getValue().toString());
                }
            } else {
                System.out.println("No local mixins map found in resolver!");
            }
        } else {
            System.out.println("Could not find _mixIns field in DeserializationConfig hierarchy!");
        }
    }
}
