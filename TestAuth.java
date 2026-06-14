import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;

public class TestAuth {
    public static void main(String[] args) throws Exception {
        String clientId = "gateway-client";
        String clientSecret = "thirumal";
        String auth = clientId + ":" + clientSecret;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());

        HttpRequest request = HttpRequest.newBuilder()
            .uri(new URI("http://localhost:9000/oauth2/token"))
            .header("Authorization", "Basic " + encodedAuth)
            .header("Content-Type", "application/x-www-form-urlencoded")
            .POST(HttpRequest.BodyPublishers.ofString("grant_type=authorization_code&code=fake&redirect_uri=http://localhost:9095/login/oauth2/code/gateway-client-oidc"))
            .build();

        HttpClient client = HttpClient.newHttpClient();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        
        System.out.println("Response Code: " + response.statusCode());
        System.out.println("Response Body: " + response.body());
    }
}
