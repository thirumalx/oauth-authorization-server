# Signup Flow

## Overview

The signup flow allows new users to register for the authorization server. The process is designed to work with OAuth2 BFF (Backend for Frontend) architecture, where the React application redirects users through the BFF to the authorization server.

## Flow Diagram

```
React App → BFF → Authorization Server (Signup Page) → User Created → Redirect to Login
```

## Step-by-Step Process

### 1. Initiate Signup

The React application or BFF redirects the user to the signup page with the `client_id` parameter:

```
GET http://localhost:9000/signup?client_id=your-client-id
```

**Parameters:**
- `client_id` (optional) - The OAuth2 registered client ID. Defaults to "Thirumal" if not provided.

### 2. Display Signup Form

The signup page displays a modern, responsive form with the following fields:

**Required Fields** (indicated by red left border when empty):
- First Name
- Last Name  
- Email
- Phone Number
- Password
- Confirm Password
- Date of Birth / Date of Incorporation

**Optional Fields** (gray left border):
- Middle Name

**Toggle Options:**
- Individual / Organisation

### 3. Visual Validation

The form provides real-time visual feedback:

- **Red left border** - Required field is empty or invalid
- **Green left border** - Required field is filled and valid
- **Gray left border** - Optional field

### 4. Form Submission

When the user submits the form:

```http
POST /signup
Content-Type: application/x-www-form-urlencoded

firstName=John&lastName=Doe&email=john@example.com&...
```

The hidden field `registeredClientId` is automatically included in the submission.

### 5. Backend Processing

The `SignupController` processes the request:

1. **Validates** all input fields
2. **Sets authorities** based on the `client_id`:
   - `bff-client-id-001`: openid, profile, message.read, message.write
   - `E-Auction`: read, openid, profile, auction.bid, auction.view
   - `pkce/pkcepostman`: read
   - Default: read, user
3. **Creates user** in the database
4. **Sends OTP** for email/phone verification (if enabled)
5. **Redirects** to login page with success message

### 6. Success Redirect

After successful signup:

```
HTTP/1.1 302 Found
Location: /login?signup=success
```

## Code Example

### Controller Method

```java
@GetMapping("/signup")
public String showSignupPage(
        @RequestParam(name = "client_id", required = false, defaultValue = "Thirumal") String registeredClientId,
        Model model) {
    UserResource userResource = new UserResource();
    userResource.setRegisteredClientId(registeredClientId);
    userResource.setAuthorities(getDefaultAuthoritiesForClient(registeredClientId));
    model.addAttribute("userResource", userResource);
    return "signup";
}
```

### Authority Mapping

Different clients receive different default authorities:

| Client ID | Authorities |
|-----------|-------------|
| bff-client-id-001 | SCOPE_openid, SCOPE_profile, SCOPE_message.read, SCOPE_message.write |
| E-Auction | SCOPE_read, SCOPE_openid, SCOPE_profile, SCOPE_auction.bid, SCOPE_auction.view |
| pkce, pkcepostman | SCOPE_read |
| Default (Thirumal) | SCOPE_read, SCOPE_user |

## Database Tables Affected

The signup process creates records in the following tables:

1. **login_user** - Main user record with UUID
2. **login_user_name** - User's name information
3. **contact** - Email and phone number
4. **password** - Encrypted password
5. **login_user_role** - User role (default: USER)
6. **oauth2_authorization_consent** - OAuth2 consent record
7. **token** - OTP tokens for verification (if enabled)

## Error Handling

Common validation errors:

- **Email already exists** - "Account for {email} is already available, please login or use forgot password"
- **Invalid email format** - "The Requested E-Mail is not valid"
- **Invalid phone number** - "The Requested Phone Number is not valid"
- **Password too weak** - "Password must contain at least 1 digit, 1 special character, 1 lowercase, 1 uppercase & minimum length of 8"

## Security Features

- **Password Encryption** - BCrypt with salt
- **Password Complexity** - Enforced minimum requirements
- **Email Validation** - Regex-based validation
- **Phone Validation** - International format support
- **CSRF Protection** - Spring Security CSRF tokens
- **Session Management** - JDBC-based session storage

## Testing

### Manual Testing

1. Navigate to `http://localhost:9000/signup`
2. Fill out the form with valid data
3. Submit and verify redirect to login
4. Check database for created user

### With Different Clients

```bash
# Default client
curl http://localhost:9000/signup

# BFF client
curl http://localhost:9000/signup?client_id=bff-client-id-001

# E-Auction client
curl http://localhost:9000/signup?client_id=E-Auction
```

## Next Steps

After successful signup:

1. User is redirected to [login page](/login)
2. User verifies email/phone with OTP (if enabled)
3. User can authenticate and receive OAuth2 tokens
