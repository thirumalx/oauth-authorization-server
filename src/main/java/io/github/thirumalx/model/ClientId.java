package io.github.thirumalx.model;
/**
 * @author Thirumal
 */
public enum ClientId {

    BFF_CLIENT_ID_001("bff-client-id-001"),
    PKCE("pkce"),
    PKCE_POSTMAN("pkcepostman");

    private final String clientId;

    ClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getClientId() {
        return clientId;
    }
}
