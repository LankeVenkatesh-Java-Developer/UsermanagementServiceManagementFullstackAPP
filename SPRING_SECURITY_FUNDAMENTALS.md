# Spring Security Fundamentals - Phase 2

## 1. What is Application Security?

### WHY do we need it?
- Applications handle sensitive data like user credentials, personal information, financial data
- Without security, anyone can access, modify, or delete data
- Prevents unauthorized access, data breaches, and attacks
- Legal requirements (GDPR, PCI-DSS, HIPAA) mandate security measures

### WHAT is it?
Application security is the practice of protecting software applications from threats and vulnerabilities throughout their lifecycle. It involves implementing controls to ensure only authorized users can access specific resources.

### Real-Time Example
In a banking application:
- Only YOU should see YOUR account balance
- Only YOU should transfer money from YOUR account
- Bank employees should only see data they're authorized to view
- No one should be able to modify transaction records

### Interview Answer
"Application security protects software from unauthorized access and data breaches. It ensures that only authenticated and authorized users can access specific resources. For example, in a banking app, users should only access their own accounts, not others' data."

---

## 2. What is Spring Security?

### WHY do we need it?
- Writing security from scratch is complex and error-prone
- Need to handle authentication, authorization, CSRF, session management, etc.
- Industry-standard, battle-tested framework
- Highly customizable and extensible

### WHAT is it?
Spring Security is a powerful and highly customizable authentication and access-control framework for Java applications. It provides comprehensive security services for Spring-based applications.

### HOW it works internally
Spring Security uses a **filter chain** pattern. When a request comes in, it passes through multiple security filters before reaching your controller. Each filter performs a specific security check.

### Real-Time Example
When you access `/api/admin/users`:
1. Request enters Spring Security filter chain
2. SecurityContextPersistenceFilter checks if user is already authenticated
3. UsernamePasswordAuthenticationFilter checks for credentials
4. FilterSecurityInterceptor checks if user has ADMIN role
5. If authorized, request reaches controller
6. If not, returns 401 or 403

### Interview Answer
"Spring Security is a security framework that provides authentication and authorization for Spring applications. It uses a filter chain pattern where each request passes through multiple security filters. For example, when accessing an admin endpoint, Spring Security checks if the user is authenticated and has the ADMIN role before allowing access."

---

## 3. Authentication

### WHY do we need it?
- Need to verify WHO is making the request
- Prevent impersonation and identity theft
- Establish user identity for authorization decisions

### WHAT is it?
Authentication is the process of verifying the identity of a user or system. It answers the question: "Who are you?"

### HOW it works internally
1. User provides credentials (username/password, token, etc.)
2. Spring Security receives credentials
3. AuthenticationManager delegates to AuthenticationProvider
4. AuthenticationProvider validates credentials
5. If valid, creates Authentication object with user details
6. Stores Authentication in SecurityContextHolder

### Real-Time Example
- Login form: You enter email and password
- System checks if email exists and password matches
- If correct, you're authenticated as "john@example.com"
- Now system knows WHO you are

### Interview Answer
"Authentication is the process of verifying a user's identity. It answers 'Who are you?' For example, when a user logs in with email and password, the system verifies these credentials and, if valid, authenticates the user. Spring Security uses AuthenticationManager and AuthenticationProvider to handle this process."

---

## 4. Authorization

### WHY do we need it?
- Not all authenticated users should access all resources
- Need to enforce access control based on roles/permissions
- Prevent privilege escalation and unauthorized actions

### WHAT is it?
Authorization is the process of determining what an authenticated user is allowed to do. It answers the question: "What are you allowed to do?"

### HOW it works internally
1. User is already authenticated (we know WHO they are)
2. Request comes to access a resource
3. Spring Security checks user's roles/authorities
4. Compares with required permissions for the resource
5. Allows or denies access based on match

### Real-Time Example
- USER role: Can view products, create orders
- ADMIN role: Can view all users, delete users, manage products
- Even if authenticated as USER, you cannot access `/api/admin/users`

### Interview Answer
"Authorization determines what an authenticated user can do. It answers 'What are you allowed to do?' For example, a USER can view products but cannot delete users, while an ADMIN can manage users. Spring Security uses roles and authorities to implement authorization."

---

## 5. Authentication vs Authorization

| Aspect | Authentication | Authorization |
|--------|----------------|---------------|
| Question | Who are you? | What can you do? |
| Purpose | Verify identity | Verify permissions |
| First step | Yes | No (requires authentication first) |
| Example | Login with email/password | Check if user has ADMIN role |
| Spring Security | AuthenticationManager | AccessDecisionManager |
| Storage | SecurityContextHolder | GrantedAuthority in Authentication |

### Real-Time Example
1. **Authentication**: You enter your ATM card and PIN → Bank verifies it's you
2. **Authorization**: You try to withdraw $10,000 → Bank checks if your account has sufficient balance and daily limit

### Interview Answer
"Authentication verifies who you are, while authorization determines what you can do. Authentication is the first step - you must be authenticated before authorization can happen. For example, logging in with credentials is authentication, and checking if you can access admin pages is authorization."

---

## 6. HTTP Basic Authentication

### WHY do we need it?
- Simple authentication mechanism for REST APIs
- Stateless, no session management required
- Easy to implement and test
- Good for machine-to-machine communication

### WHAT is it?
HTTP Basic Authentication sends credentials in the Authorization header with each request. Credentials are base64-encoded (not encrypted).

### HOW it works internally
1. Client sends request with header: `Authorization: Basic base64(username:password)`
2. Spring Security's BasicAuthenticationFilter extracts credentials
3. Decodes base64 to get username and password
4. Creates UsernamePasswordAuthenticationToken
5. Authenticates using AuthenticationManager
6. If successful, sets Authentication in SecurityContext

### Real-Time Example
```
GET /api/products
Authorization: Basic am9obkBleGFtcGxlLmNvbTpwYXNzd29yZDEyMw==
```
Decoded: `john@example.com:password123`

### Interview Answer
"HTTP Basic Authentication sends credentials in the Authorization header encoded in base64. The client sends 'Basic base64(username:password)' with each request. Spring Security's BasicAuthenticationFilter extracts and validates these credentials. It's simple but should be used with HTTPS since base64 is not encryption."

---

## 7. Form-based Authentication

### WHY do we need it?
- Traditional web applications need login forms
- User-friendly interface for human users
- Can include CSRF protection, remember-me features
- Session-based authentication for web apps

### WHAT is it?
Form-based authentication uses an HTML login form to collect credentials and authenticate users.

### HOW it works internally
1. User accesses protected resource
2. Spring Security redirects to login page
3. User submits login form with username/password
4. UsernamePasswordAuthenticationFilter processes the form
5. Authenticates credentials
6. If successful, creates session and redirects to original URL
7. Subsequent requests use session ID for authentication

### Real-Time Example
- You visit `/dashboard`
- Redirected to `/login`
- Enter username and password
- After successful login, redirected to `/dashboard`
- Session cookie stored in browser

### Interview Answer
"Form-based authentication uses an HTML login form for user authentication. When accessing a protected resource, Spring Security redirects to a login page. After successful authentication, a session is created and stored as a cookie. It's suitable for traditional web applications with human users."

---

## 8. Spring Security Filter Chain

### WHY do we need it?
- Multiple security concerns need to be addressed (auth, CSRF, CORS, etc.)
- Each concern is a separate responsibility
- Chain of responsibility pattern allows flexible composition
- Filters can be added/removed/configured independently

### WHAT is it?
The Spring Security filter chain is a series of filters that every HTTP request passes through before reaching your application. Each filter performs a specific security function.

### HOW it works internally
```
Request → Filter1 → Filter2 → Filter3 → ... → FilterN → Controller
```

Common filters (in order):
1. **SecurityContextPersistenceFilter**: Loads/stores SecurityContext
2. **LogoutFilter**: Handles logout requests
3. **UsernamePasswordAuthenticationFilter**: Processes login
4. **BasicAuthenticationFilter**: Handles HTTP Basic auth
5. **RequestCacheAwareFilter**: Restores saved requests
6. **SecurityContextHolderAwareRequestFilter**: Wraps request
7. **AnonymousAuthenticationFilter**: Creates anonymous auth if none
8. **SessionManagementFilter**: Handles session security
9. **ExceptionTranslationFilter**: Handles security exceptions
10. **FilterSecurityInterceptor**: Performs authorization

### Real-Time Example
Request to `/api/admin/users`:
1. SecurityContextPersistenceFilter: No existing context
2. BasicAuthenticationFilter: Extracts credentials from header
3. Authenticates user
4. FilterSecurityInterceptor: Checks if user has ADMIN role
5. If yes → Controller, if no → 403 Forbidden

### Interview Answer
"Spring Security uses a filter chain where each request passes through multiple security filters. Common filters include SecurityContextPersistenceFilter, BasicAuthenticationFilter, and FilterSecurityInterceptor. Each filter handles a specific security concern like authentication, authorization, or CSRF protection."

---

## 9. SecurityContext

### WHY do we need it?
- Need to store authenticated user information
- Multiple parts of application need to access current user
- Thread-local storage for user context
- Enables authorization checks throughout request

### WHAT is it?
SecurityContext holds the Authentication object for the current user. It's stored in SecurityContextHolder.

### HOW it works internally
1. After successful authentication, Authentication object created
2. Authentication stored in SecurityContext
3. SecurityContext stored in SecurityContextHolder (thread-local)
4. Any code in the same thread can access current user
5. At end of request, context cleared

### Real-Time Example
```java
// In any service or controller
Authentication auth = SecurityContextHolder.getContext().getAuthentication();
String username = auth.getName();
Collection<GrantedAuthority> authorities = auth.getAuthorities();
```

### Interview Answer
"SecurityContext holds the Authentication object for the current user. It's stored in SecurityContextHolder using thread-local storage. After authentication, the user's details are available throughout the request via SecurityContextHolder.getContext().getAuthentication()."

---

## 10. SecurityContextHolder

### WHY do we need it?
- Central place to access security information
- Thread-local storage ensures each thread has its own context
- Provides static methods for easy access
- Supports different storage strategies (thread-local, inherited, etc.)

### WHAT is it?
SecurityContextHolder is the class that stores the SecurityContext. It provides static methods to get/set the security context.

### HOW it works internally
```java
// Default strategy: ThreadLocalSecurityContextHolderStrategy
// Each thread has its own SecurityContext
SecurityContextHolder.getContext().setAuthentication(authentication);
Authentication auth = SecurityContextHolder.getContext().getAuthentication();
SecurityContextHolder.clearContext(); // Clear at end of request
```

### Real-Time Example
```java
@Service
public class OrderService {
    public Order createOrder(OrderRequest request) {
        // Get current authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        // Create order for this user
        return orderRepository.save(new Order(user, request));
    }
}
```

### Interview Answer
"SecurityContextHolder is the central place where Spring Security stores the SecurityContext. It uses thread-local storage by default, so each thread has its own security context. You can access the current authenticated user using SecurityContextHolder.getContext().getAuthentication()."

---

## 11. Authentication Object

### WHY do we need it?
- Represents the authenticated user's identity
- Contains principal, credentials, and authorities
- Used throughout the application for authorization
- Standard interface for different authentication methods

### WHAT is it?
Authentication is an interface that represents the authentication request or the authenticated principal. It contains:
- Principal: The user identity (username, user object)
- Credentials: Proof of identity (password, token)
- Authorities: Roles/permissions granted to the user
- Details: Additional authentication information
- Authenticated: Whether authentication was successful

### HOW it works internally
```java
public interface Authentication extends Principal {
    Collection<? extends GrantedAuthority> getAuthorities();
    Object getCredentials();
    Object getDetails();
    Object getPrincipal();
    boolean isAuthenticated();
    void setAuthenticated(boolean isAuthenticated);
}
```

### Real-Time Example
```java
UsernamePasswordAuthenticationToken auth = 
    new UsernamePasswordAuthenticationToken(
        user,              // Principal
        null,              // Credentials (null after auth)
        user.getAuthorities() // Authorities
    );
```

### Interview Answer
"The Authentication object represents an authenticated user. It contains the principal (user identity), credentials (password/token), authorities (roles/permissions), and authentication status. After authentication, Spring Security stores this object in the SecurityContext."

---

## 12. Principal

### WHY do we need it?
- Need to identify WHO is authenticated
- Can be username, email, or full user object
- Standard interface across different authentication mechanisms
- Enables authorization based on user identity

### WHAT is it?
Principal represents the authenticated user's identity. In Spring Security, the Authentication interface extends Principal, so the Authentication object itself is the principal.

### HOW it works internally
```java
// Principal can be:
String username = "john@example.com";
// Or a full user object:
User user = new User("john@example.com", "encodedPassword", authorities);
```

### Real-Time Example
```java
@GetMapping("/profile")
public ResponseEntity<UserProfile> getProfile() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    Object principal = auth.getPrincipal(); // This is the Principal
    // If using UserDetails, principal is the User object
    User user = (User) principal;
    return ResponseEntity.ok(user.getProfile());
}
```

### Interview Answer
"Principal represents the authenticated user's identity. In Spring Security, the Authentication object itself is the principal. It can be a simple username or a full user object. You can access it via authentication.getPrincipal() to get the current user's details."

---

## 13. GrantedAuthority

### WHY do we need it?
- Need to represent user permissions/roles
- Used for authorization decisions
- Can be fine-grained permissions or high-level roles
- Standard interface for different authorization mechanisms

### WHAT is it?
GrantedAuthority represents an authority granted to the authenticated user. It's typically a role (ROLE_ADMIN) or a permission (READ_PRODUCT, WRITE_ORDER).

### HOW it works internally
```java
public interface GrantedAuthority extends Serializable {
    String getAuthority();
}
```

Common implementations:
- SimpleGrantedAuthority: String-based authority
- Role-based: "ROLE_USER", "ROLE_ADMIN"
- Permission-based: "READ_PRODUCT", "DELETE_USER"

### Real-Time Example
```java
// In User entity implementing UserDetails
@Override
public Collection<? extends GrantedAuthority> getAuthorities() {
    return Set.of(
        new SimpleGrantedAuthority("ROLE_USER"),
        new SimpleGrantedAuthority("READ_PRODUCT")
    );
}

// Check authority in code
if (auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"))) {
    // User is admin
}
```

### Interview Answer
"GrantedAuthority represents a user's permissions or roles. It's used for authorization decisions. Common examples are 'ROLE_USER', 'ROLE_ADMIN', or specific permissions like 'READ_PRODUCT'. The getAuthorities() method in UserDetails returns the collection of authorities for a user."

---

## 14. Role vs Authority

| Aspect | Role | Authority |
|--------|------|-----------|
| Purpose | High-level grouping of permissions | Specific permission |
| Naming | Convention: ROLE_XXX | Any string |
| Granularity | Coarse-grained | Fine-grained |
| Example | ROLE_ADMIN, ROLE_USER | READ_PRODUCT, DELETE_ORDER |
| Usage | hasRole("ADMIN") | hasAuthority("READ_PRODUCT") |
| Relationship | Role = Collection of authorities | Authority = Single permission |

### Real-Time Example
```java
// Role-based
@PreAuthorize("hasRole('ADMIN')")
public void deleteUser(Long id) { }

// Authority-based
@PreAuthorize("hasAuthority('DELETE_USER')")
public void deleteUser(Long id) { }

// User can have both:
ROLE_ADMIN → [READ_USER, WRITE_USER, DELETE_USER, READ_PRODUCT, WRITE_PRODUCT]
ROLE_USER → [READ_PRODUCT, CREATE_ORDER]
```

### Interview Answer
"Roles are high-level groupings of permissions, typically prefixed with 'ROLE_', like ROLE_ADMIN or ROLE_USER. Authorities are fine-grained permissions like READ_PRODUCT or DELETE_USER. A role typically contains multiple authorities. In Spring Security, hasRole() automatically adds 'ROLE_' prefix, while hasAuthority() checks the exact string."

---

## 15. CSRF (Cross-Site Request Forgery)

### WHY do we need it?
- Prevents attackers from executing unwanted actions on behalf of authenticated users
- Common attack: User logged into bank, visits malicious site, malicious site sends request to bank
- Without CSRF protection, bank executes the request

### WHAT is it?
CSRF is an attack where a malicious site tricks a user's browser into executing unwanted actions on a site where the user is authenticated.

### HOW Spring Security protects
1. Generates a random CSRF token for each session
2. Token stored in server-side session
3. Token must be included in state-changing requests (POST, PUT, DELETE)
4. Spring Security validates token on each request
5. If token missing or invalid → 403 Forbidden

### Real-Time Example
```
Legitimate request:
POST /transfer
Headers: X-CSRF-TOKEN: abc123
Body: {to: "attacker", amount: 1000}

Malicious request from evil.com:
POST /transfer (no CSRF token)
→ Rejected by Spring Security
```

### Interview Answer
"CSRF (Cross-Site Request Forgery) is an attack where a malicious site tricks a user's browser into executing unwanted actions. Spring Security protects against CSRF by generating a token for each session and requiring it in state-changing requests. For REST APIs with JWT, we typically disable CSRF since JWT provides protection."

---

## 16. CORS (Cross-Origin Resource Sharing)

### WHY do we need it?
- Browsers restrict cross-origin requests for security
- Frontend on localhost:3000 cannot call API on localhost:8080 by default
- Need to explicitly allow cross-origin requests

### WHAT is it?
CORS is a browser security mechanism that restricts cross-origin HTTP requests. It allows servers to specify which origins can access their resources.

### HOW it works
1. Browser sends preflight OPTIONS request
2. Server responds with allowed origins, methods, headers
3. Browser checks if request is allowed
4. If allowed, sends actual request

### Real-Time Example
```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("http://localhost:3000");
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        config.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

### Interview Answer
"CORS (Cross-Origin Resource Sharing) is a browser security feature that restricts cross-origin requests. When a frontend on one domain calls an API on another domain, the browser blocks it by default. We need to configure CORS to explicitly allow specific origins, methods, and headers."

---

## 17. Session Management

### WHY do we need it?
- Track authenticated user across multiple requests
- Store user state without re-authenticating
- Control session lifecycle (timeout, fixation, concurrency)

### WHAT is it?
Session management is the process of maintaining user state across multiple HTTP requests using server-side sessions.

### HOW it works
1. User authenticates successfully
2. Server creates session with unique ID
3. Session ID sent to client as cookie (JSESSIONID)
4. Client sends session ID with each request
5. Server looks up session by ID
6. User remains authenticated until session expires

### Real-Time Example
```java
@Configuration
public class SessionConfig {
    @Bean
    public SessionManagementConfigurer sessionManagement() {
        return new SessionManagementConfigurer()
            .sessionFixation().migrateSession()
            .maximumSessions(1)
            .maxSessionsPreventsLogin(true);
    }
}
```

### Interview Answer
"Session management maintains user state across multiple requests using server-side sessions. After authentication, a session is created and its ID is stored as a cookie. The session ID is sent with each request to identify the user. Spring Security provides session fixation protection, concurrency control, and timeout configuration."

---

## 18. Stateless vs Stateful Authentication

| Aspect | Stateless (JWT) | Stateful (Session) |
|--------|-----------------|-------------------|
| Storage | Token stored on client | Session stored on server |
| Scalability | Easy to scale horizontally | Requires session replication |
| Server load | Less server load | Server maintains sessions |
| Revocation | Difficult to revoke tokens | Easy to invalidate session |
| Use case | REST APIs, microservices | Traditional web apps |

### Real-Time Example
**Stateless (JWT)**:
- Client stores token in localStorage
- Each request includes token in Authorization header
- Server validates token signature (no database lookup)
- Suitable for microservices

**Stateful (Session)**:
- Server stores session in memory/Redis
- Client stores session ID in cookie
- Server looks up session by ID
- Suitable for monolithic web apps

### Interview Answer
"Stateless authentication (like JWT) stores the token on the client and doesn't require server-side session storage, making it easier to scale. Stateful authentication (like sessions) stores session data on the server, which is easier to manage but requires session replication in distributed systems."

---

## 19. 401 Unauthorized vs 403 Forbidden

| Status Code | Meaning | When to Use |
|-------------|---------|-------------|
| 401 Unauthorized | Authentication failed or missing | User not logged in, invalid credentials |
| 403 Forbidden | Authentication successful but insufficient permissions | User logged in but lacks required role/authority |

### Real-Time Example
```java
// 401 - No authentication
GET /api/admin/users
Authorization: (missing)
→ 401 Unauthorized

// 401 - Invalid credentials
POST /api/auth/login
{email: "john@example.com", password: "wrong"}
→ 401 Unauthorized

// 403 - Insufficient permissions
GET /api/admin/users
Authorization: Bearer <USER_ROLE_TOKEN>
→ 403 Forbidden (USER cannot access ADMIN endpoint)
```

### Interview Answer
"401 Unauthorized means authentication failed or is missing - the user doesn't have valid credentials. 403 Forbidden means the user is authenticated but doesn't have sufficient permissions. For example, accessing an admin endpoint without logging in returns 401, while accessing it as a regular USER returns 403."

---

## 20. What Happens When We Add spring-boot-starter-security

### Automatic Configurations
When you add `spring-boot-starter-security`, Spring Boot automatically:

1. **Enables Spring Security** for all endpoints
2. **Creates default SecurityFilterChain** that protects all endpoints
3. **Sets up HTTP Basic authentication** by default
4. **Generates default password** (printed in console: "Using generated security password")
5. **Enables CSRF protection** by default
6. **Creates default login form** at `/login`
7. **Creates default logout endpoint** at `/logout`
8. **Enables session management** with default settings

### Default Behavior
```properties
# All endpoints require authentication
# Default username: user
# Default password: generated (check console)
# Login page: /login
# Logout: POST /logout
```

### Real-Time Example
After adding dependency:
```
Access: http://localhost:8080/api/products
→ Redirects to: http://localhost:8080/login
→ Login with: user / <generated-password>
→ Redirects back to: /api/products
```

### Interview Answer
"When we add spring-boot-starter-security, Spring Boot automatically enables security for all endpoints. It sets up HTTP Basic authentication, generates a default password (printed in console), enables CSRF protection, and creates default login/logout endpoints. We override these defaults by creating a SecurityConfig bean."

---

## 21. Default Credentials Override

### WHY do we need it?
- Default credentials are not secure for production
- Need custom username/password from database
- Need to integrate with existing user management

### HOW to override
```java
@Configuration
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .httpBasic(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                .anyRequest().authenticated()
            );
        return http.build();
    }
    
    @Bean
    public InMemoryUserDetailsManager userDetailsService() {
        UserDetails user = User.builder()
            .username("admin")
            .password(passwordEncoder().encode("admin123"))
            .roles("ADMIN")
            .build();
        
        UserDetails normalUser = User.builder()
            .username("user")
            .password(passwordEncoder().encode("user123"))
            .roles("USER")
            .build();
        
        return new InMemoryUserDetailsManager(user, normalUser);
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

### Real-Time Example
```
Login with: admin / admin123 → Has ADMIN role
Login with: user / user123 → Has USER role
```

### Interview Answer
"We override default credentials by providing a UserDetailsService bean. Using InMemoryUserDetailsManager, we can define users with custom usernames, passwords, and roles. For production, we implement a custom UserDetailsService that loads users from a database with BCrypt-encoded passwords."

---

## Summary of Key Components

| Component | Purpose | Key Method/Property |
|-----------|---------|---------------------|
| SecurityContextHolder | Stores security context | getContext(), setAuthentication() |
| SecurityContext | Holds Authentication object | getAuthentication() |
| Authentication | Represents authenticated user | getPrincipal(), getAuthorities() |
| GrantedAuthority | User's permissions | getAuthority() |
| UserDetailsService | Loads user details | loadUserByUsername() |
| PasswordEncoder | Encodes/validates passwords | encode(), matches() |
| SecurityFilterChain | Configures security filters | authorizeHttpRequests() |
| AuthenticationManager | Processes authentication | authenticate() |
| AuthenticationProvider | Validates credentials | authenticate() |

---

## Next Steps

Now that we understand the fundamentals, we'll implement:
1. Custom SecurityFilterChain configuration
2. Database-based authentication with UserDetailsService
3. JWT-based stateless authentication
4. Role-based authorization
5. Microservices security with API Gateway
