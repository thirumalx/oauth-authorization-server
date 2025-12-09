# OAuth2 Clients

## Overview

The authorization server supports multiple OAuth2 registered clients, each with different configurations and scopes.

## Registered Clients

### 1. Thirumal (Default)

**Client ID:** `Thirumal`  
**Client Secret:** `secret` (BCrypt encrypted)  
**Grant Types:** refresh_token, client_credentials, authorization_code  
**Scopes:** read, openid, profile  
**Redirect URIs:**
- http://127.0.0.1:8000/authorized
- http://127.0.0.1:8000/login/oauth2/code/users-client-oidc

**Default Authorities for Signup:**
- SCOPE_read
- SCOPE_user

### 2. E-Auction

**Client ID:** `E-Auction`  
**Client Secret:** `secret` (BCrypt encrypted)  
**Grant Types:** refresh_token, client_credentials, authorization_code  
**Scopes:** read, openid, profile  
**Redirect URIs:**
- http://127.0.0.1:8000/authorized
- http://127.0.0.1:8000/login/oauth2/code/users-client-oidc

**Default Authorities for Signup:**
- SCOPE_read
- SCOPE_openid
- SCOPE_profile
- SCOPE_auction.bid
- SCOPE_auction.view

### 3. PKCE Client

**Client ID:** `pkce`  
**Client Secret:** None (public client)  
**Grant Types:** refresh_token, authorization_code  
**Scopes:** read  
**Redirect URIs:**
- http://localhost:3000/authorized

**Authentication Method:** none (PKCE required)  
**Require Authorization Consent:** false

**Default Authorities for Signup:**
- SCOPE_read

### 4. PKCE Postman

**Client ID:** `pkcepostman`  
**Client Secret:** None (public client)  
**Grant Types:** refresh_token, authorization_code  
**Scopes:** read  
**Redirect URIs:**
- https://oauth.pstmn.io/v1/callback

**Post Logout Redirect URI:**
- http://localhost:2223/

**Default Authorities for Signup:**
- SCOPE_read

### 5. BFF Client

**Client ID:** `bff-client-id-001`  
**Client Secret:** `secret` (BCrypt encrypted)  
**Grant Types:** authorization_code, refresh_token  
**Scopes:** openid, profile, message.read, message.write  
**Redirect URIs:**
- http://localhost:2223/login/oauth2/code/bff-client-oidc
- http://localhost:2223/authorized

**Default Authorities for Signup:**
- SCOPE_openid
- SCOPE_profile
- SCOPE_message.read
- SCOPE_message.write

## Client Configuration

### Database Schema

Clients are stored in the `oauth2_registered_client` table:

```sql
CREATE TABLE oauth2_registered_client (
    id varchar(100) PRIMARY KEY,
    client_id varchar(100) NOT NULL,
    client_secret varchar(200),
    client_name varchar(200) NOT NULL,
    client_authentication_methods varchar(1000) NOT NULL,
    authorization_grant_types varchar(1000) NOT NULL,
    redirect_uris varchar,
    scopes varchar(1000) NOT NULL,
    client_settings varchar(2000) NOT NULL,
    token_settings varchar(2000) NOT NULL
);
```

### Adding a New Client

To add a new OAuth2 client:

1. Insert into `oauth2_registered_client` table
2. Update `SignupController.getDefaultAuthoritiesForClient()` method
3. Configure redirect URIs and scopes

Example:

```sql
INSERT INTO oauth2_registered_client (
    id, client_id, client_secret, client_name,
    client_authentication_methods, authorization_grant_types,
    redirect_uris, scopes, client_settings, token_settings
) VALUES (
    'my-app',
    'my-app-client',
    '$2a$10$...',  -- BCrypt encrypted secret
    'My Application',
    'client_secret_basic',
    'authorization_code,refresh_token',
    'http://localhost:3000/callback',
    'read,write,openid',
    '{"@class":"java.util.Collections$UnmodifiableMap","settings.client.require-proof-key":false}',
    '{"@class":"java.util.Collections$UnmodifiableMap","settings.token.access-token-time-to-live":["java.time.Duration",3600.000000000]}'
);
```

## Token Settings

### Access Token

- **Time to Live:** 50 minutes (3000 seconds)
- **Format:** self-contained (JWT)

### Refresh Token

- **Time to Live:** 60 minutes (3600 seconds)
- **Reuse:** true

### Authorization Code

- **Time to Live:** 5 minutes (300 seconds)

## Client Settings

### Require Proof Key (PKCE)

- **PKCE clients:** true
- **Confidential clients:** false

### Require Authorization Consent

- **Default:** true
- **PKCE clients:** false

## Usage Examples

### Authorization Code Flow

```bash
# 1. Get authorization code
curl -X GET "http://localhost:9000/oauth2/authorize?\
response_type=code&\
client_id=Thirumal&\
redirect_uri=http://127.0.0.1:8000/authorized&\
scope=read openid profile"

# 2. Exchange code for token
curl -X POST "http://localhost:9000/oauth2/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -u "Thirumal:secret" \
  -d "grant_type=authorization_code&\
code=AUTHORIZATION_CODE&\
redirect_uri=http://127.0.0.1:8000/authorized"
```

### Client Credentials Flow

```bash
curl -X POST "http://localhost:9000/oauth2/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -u "Thirumal:secret" \
  -d "grant_type=client_credentials&scope=read"
```

### Refresh Token Flow

```bash
curl -X POST "http://localhost:9000/oauth2/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -u "Thirumal:secret" \
  -d "grant_type=refresh_token&refresh_token=REFRESH_TOKEN"
```

## Security Considerations

- Always use HTTPS in production
- Store client secrets securely (BCrypt encrypted)
- Use PKCE for public clients (mobile/SPA)
- Implement proper redirect URI validation
- Set appropriate token expiration times
- Enable authorization consent for sensitive scopes
