import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = "$2a$10$M0D7JM8IErxNfdNCRccHgOR3ImXzr/nV5NQO1kRZZCIaaDM.YhA5e";
        System.out.println("Matches 'Thirumal': " + encoder.matches("Thirumal", hash));
        System.out.println("Matches 'thirumal': " + encoder.matches("thirumal", hash));
    }
}
