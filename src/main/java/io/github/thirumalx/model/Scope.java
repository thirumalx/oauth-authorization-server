package io.github.thirumalx.model;

import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.authority.SimpleGrantedAuthority;

public class  Scope {
    // Enum constants by application-wise
    // Common scopes
    public static final String READ = "SCOPE_read";
    public static final String WRITE = "SCOPE_write";
    public static final String USER = "SCOPE_user";
    // BFF client scopes
    public static final String OPENID = "SCOPE_openid";
    public static final String PROFILE = "SCOPE_profile";
    // E-Auction client scopes
    public static final String AUCTION_BID = "SCOPE_auction.bid";
    public static final String AUCTION_VIEW = "SCOPE_auction.view";
    // Message client scopes
    public static final String MESSAGE_READ = "SCOPE_message.read";
    public static final String MESSAGE_WRITE = "SCOPE_message.write";

    private final String scopeName;

    public static final Set<String> DEFAULT_SCOPES = Set.of(READ, WRITE, USER, OPENID, PROFILE);

    public Scope(String scopeName) {
        this.scopeName = scopeName;
    }

        /**
     * Get default authorities based on the registered client
     * Different clients may have different default scopes
     */
    public static Set<SimpleGrantedAuthority> getDefaultAuthoritiesByClient(String clientId) {
        var defaultScopes = Scope.DEFAULT_SCOPES.stream()
                    .map(scope -> new SimpleGrantedAuthority(scope))
                    .collect(Collectors.toSet());
        if (clientId == null) {
            return defaultScopes;
        }
        return switch (clientId) {
            case "bff-client-id-001" -> Set.of(
                    new SimpleGrantedAuthority(READ),
                    new SimpleGrantedAuthority(OPENID),
                    new SimpleGrantedAuthority(PROFILE),
                    new SimpleGrantedAuthority(MESSAGE_READ),
                    new SimpleGrantedAuthority(MESSAGE_WRITE));
            case "E-Auction" -> Set.of(
                    new SimpleGrantedAuthority(READ),
                    new SimpleGrantedAuthority(OPENID),
                    new SimpleGrantedAuthority(PROFILE),
                    new SimpleGrantedAuthority(AUCTION_BID),
                    new SimpleGrantedAuthority(AUCTION_VIEW));
            case "pkce", "pkcepostman" -> Set.of(
                    new SimpleGrantedAuthority(READ));
            default -> defaultScopes;
        };
    }

    public String getScopeName() {
        return scopeName;
    }

    @Override
    public String toString() {
        return scopeName;
    }
}