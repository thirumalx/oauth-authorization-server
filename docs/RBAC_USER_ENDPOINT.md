# Role-Based Access Control for /user Endpoint

## Overview

The `/user` endpoint is now protected by **role-based access control (RBAC)** instead of port-based filtering. Only users with the `ADMIN` role can access this endpoint.

---

## Implementation Details

### 1. Security Configuration

**File:** `AuthorizationServerConfig.java`

The security filter chain now includes:

```java
.requestMatchers("/user/**").hasAuthority("ADMIN")
```

This ensures that:
- Only authenticated users with the `ADMIN` authority can access `/user` and its sub-paths
- Users without the `ADMIN` role will receive a **403 Forbidden** error
- The restriction applies to **both ports** (9000 and 9001)

### 2. Custom Access Denied Handler

A custom access denied handler provides clear error messages:

```java
.exceptionHandling(exceptions -> exceptions
    .accessDeniedHandler((request, response, accessDeniedException) -> {
        if (request.getRequestURI().startsWith("/user")) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, 
                "Access denied. Admin role required to access this resource.");
        } else {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access denied.");
        }
    }))
```

---

## Role Structure

### Database Schema

Roles are stored in the `lookup.role_cd` table:

| role_cd | code    | Description |
|---------|---------|-------------|
| 1       | USER    | Regular user |
| 2       | SUPPORT | Support staff |
| 3       | ADMIN   | Administrator |

### User Role Assignment

User roles are stored in the `login_user_role` table and loaded by `UserDetailsServiceImpl`:

```java
List<LoginUserRole> loginUserRoles = loginUserRoleRepository.findAllByLoginUserId(loginUser.getLoginUserId());
List<SimpleGrantedAuthority> authorities = new ArrayList<>();     
for (LoginUserRole loginUserRole : loginUserRoles) {
    authorities.add(new SimpleGrantedAuthority(loginUserRole.getRole()));
}
```

**Important:** Roles are stored **without** the `ROLE_` prefix (e.g., "ADMIN" not "ROLE_ADMIN").

---

## Access Control Matrix

| User Role | Can Access /user? | Can Access Other Endpoints? |
|-----------|-------------------|------------------------------|
| USER      | ❌ No (403)       | ✅ Yes (if authenticated)    |
| SUPPORT   | ❌ No (403)       | ✅ Yes (if authenticated)    |
| ADMIN     | ✅ Yes            | ✅ Yes                       |
| Anonymous | ❌ No (Redirect)  | ❌ No (Redirect to login)    |

---

## Testing

### 1. Test with Regular User (No Admin Role)

```bash
# Login as a regular user
curl -X POST http://localhost:9000/login \
  -d "username=regularuser@example.com&password=password"

# Try to access /user endpoint
curl http://localhost:9000/user
# Expected: HTTP 403 Forbidden
# Message: "Access denied. Admin role required to access this resource."
```

### 2. Test with Admin User

```bash
# Login as an admin user
curl -X POST http://localhost:9000/login \
  -d "username=admin@example.com&password=password"

# Access /user endpoint
curl http://localhost:9000/user
# Expected: HTTP 200 OK with user management page
```

### 3. Test on Both Ports

The role-based restriction works on **both ports**:

```bash
# Port 9000 (Main application)
curl http://localhost:9000/user
# Requires ADMIN role

# Port 9001 (Admin port)
curl http://localhost:9001/user
# Also requires ADMIN role
```

---

## Granting Admin Access to Users

### SQL Query to Assign Admin Role

To grant a user admin access, insert a record in the `login_user_role` table:

```sql
INSERT INTO login_user_role (
    login_user_id, 
    role_cd, 
    role, 
    start_time
) VALUES (
    <user_login_id>,  -- The user's login_user_id
    3,                -- ADMIN role code
    'ADMIN',          -- Role name
    NOW()             -- Start time
);
```

### Example: Grant Admin Role to User

```sql
-- Find the user's login_user_id
SELECT login_user_id, login_uuid 
FROM login_user 
WHERE login_uuid = 'user-uuid-here';

-- Grant ADMIN role
INSERT INTO login_user_role (login_user_id, role_cd, role, start_time)
VALUES (123, 3, 'ADMIN', NOW());
```

---

## Security Benefits

### ✅ Advantages of Role-Based Access Control

1. **Fine-grained control**: Access is based on user roles, not network configuration
2. **Scalable**: Easy to add more roles and permissions
3. **Auditable**: Role assignments are tracked in the database
4. **OAuth2 compliant**: Works seamlessly with OAuth2 authorization flows
5. **Multi-client support**: Different OAuth2 clients can have users with different roles
6. **Port-agnostic**: Works consistently across all ports

### 🔒 Security Considerations

1. **Role assignment**: Ensure only trusted administrators can assign the ADMIN role
2. **Session management**: Admin sessions should have appropriate timeout settings
3. **Audit logging**: Consider logging all access attempts to `/user` endpoint
4. **Password policies**: Enforce strong password policies for admin accounts
5. **MFA**: Consider implementing multi-factor authentication for admin users

---

## Configuration Files Modified

### 1. `AuthorizationServerConfig.java`
- Added `.hasAuthority("ADMIN")` for `/user/**` endpoints
- Added custom access denied handler
- Removed port-based filter dependency

### 2. `LoginUserRole.java`
- Fixed typo: `ASMIN` → `ADMIN`

### 3. `PortBasedAccessFilter.java`
- ❌ Deleted (no longer needed)

---

## Dual-Port Setup

Your application still runs on two ports:

- **Port 9000**: Main application port
- **Port 9001**: Admin port (configured in `AdminServerConfig.java`)

Both ports serve the same application with the same security rules. The admin port can be used for:
- Network-level isolation (e.g., firewall rules)
- Load balancer configuration
- Internal vs. external access separation

---

## Future Enhancements

Consider these improvements:

1. **Method-level security**: Use `@PreAuthorize("hasAuthority('ADMIN')")` on controller methods
2. **Role hierarchy**: Implement role hierarchy (e.g., SUPER_ADMIN > ADMIN > SUPPORT > USER)
3. **Dynamic permissions**: Store permissions separately from roles
4. **OAuth2 scopes**: Map OAuth2 scopes to roles for client applications
5. **Audit logging**: Log all admin actions for compliance

---

## Troubleshooting

### Issue: User with ADMIN role gets 403 Forbidden

**Possible causes:**
1. Role is stored with `ROLE_` prefix in database
2. User session is cached with old roles
3. Role assignment has expired (`end_time` is set)

**Solution:**
```sql
-- Check user's roles
SELECT lr.role, lr.start_time, lr.end_time
FROM login_user_role lr
WHERE lr.login_user_id = <user_id>
AND (lr.end_time IS NULL OR lr.end_time > NOW());

-- Ensure role is exactly 'ADMIN' (not 'ROLE_ADMIN')
UPDATE login_user_role 
SET role = 'ADMIN' 
WHERE role = 'ROLE_ADMIN';
```

### Issue: All users can access /user endpoint

**Possible causes:**
1. Security configuration not applied
2. Filter chain order is incorrect

**Solution:**
- Restart the application
- Check logs for security configuration errors
- Verify `@Order(2)` on `applicationSecurityFilterChain`

---

## Summary

✅ **Implemented**: Role-based access control for `/user` endpoint  
✅ **Required Role**: `ADMIN`  
✅ **Applies To**: All ports (9000 and 9001)  
✅ **Error Handling**: Custom 403 Forbidden message  
✅ **Build Status**: Successful  

The `/user` endpoint is now secure and only accessible to users with the ADMIN role!
