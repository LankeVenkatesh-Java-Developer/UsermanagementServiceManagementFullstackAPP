# Custom Spring Security Configuration - Phase 3

## Overview

In Phase 3, we implement custom Spring Security configuration using modern Spring Security 6.x APIs. We move away from default behavior and create a fully customized security setup.

---

## 1. SecurityFilterChain

### WHY do we need it?
- Default Spring Security protects ALL endpoints
- We need to configure which endpoints are public vs protected
- Need to set up role-based access control
- Configure authentication mechanisms (HTTP Basic, JWT, etc.)
- Configure CSRF, CORS, session management

### WHAT is it?
SecurityFilterChain is a bean that configures the entire security filter chain. It replaces the deprecated WebSecurityConfigurerAdapter in Spring Security 6.x.

### HOW it works internally
```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())                    // Configure CSRF
        .authorizeHttpRequests(auth -> auth              // Configure authorization
            .requestMatchers("/api/auth/**").permitAll() // Public endpoints
            .requestMatchers("/api/admin/**").hasRole("ADMIN") // Role-based
            .anyRequest().authenticated()                 // Default: require auth
        )
        .httpBasic(httpBasic -> {})                       // HTTP Basic auth
        .sessionManagement(session -> session             // Session management
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        );
    return http.build();
}
```

### Line-by-Line Explanation

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
```
- Creates a SecurityFilterChain bean
- HttpSecurity is the main builder for security configuration
- Spring Security automatically uses this bean

```java
http.csrf(csrf -> csrf.disable())
```
- Disables CSRF protection
- WHY disable for REST APIs?
  - REST APIs are typically stateless
  - CSRF is for form-based submissions
  - JWT provides protection against CSRF
- For traditional web apps with forms, you would enable CSRF

```java
.authorizeHttpRequests(auth -> auth
```
- Configures authorization rules
- authorizeHttpRequests() is the modern method (Spring Security 6.x)
- Replaces the deprecated authorizeRequests()

```java
.requestMatchers("/api/auth/register").permitAll()
.requestMatchers("/api/auth/login").permitAll()
.requestMatchers("/api/public/**").permitAll()
```
- permitAll() allows unauthenticated access
- These endpoints are public - no authentication required
- Examples: registration, login, public APIs

```java
.requestMatchers("/api/products/**").hasAnyRole("USER", "ADMIN")
.requestMatchers("/api/orders/**").hasAnyRole("USER", "ADMIN")
```
- hasAnyRole() requires at least one of the specified roles
- Both USER and ADMIN can access products and orders
- Spring Security automatically adds "ROLE_" prefix
- Equivalent to: hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")

```java
.requestMatchers("/api/admin/**").hasRole("ADMIN")
```
- hasRole() requires the exact role
- Only ADMIN can access admin endpoints
- Equivalent to: hasAuthority("ROLE_ADMIN")

```java
.anyRequest().authenticated()
```
- Default rule for all other endpoints
- Requires authentication but no specific role
- Any authenticated user can access

```java
.httpBasic(httpBasic -> {})
```
- Enables HTTP Basic authentication
- Client sends: Authorization: Basic base64(username:password)
- Good for initial testing and machine-to-machine communication
- Will be replaced with JWT in Phase 5

```java
.sessionManagement(session -> session
    .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
)
```
- STATELESS: No HTTP session will be created or used
- Essential for JWT-based authentication
- Each request must be authenticated independently
- Reduces server memory usage (no session storage)

```java
return http.build();
```
- Builds and returns the SecurityFilterChain
- Spring Security registers this filter chain

### Real-Time Example
```
Request: GET /api/products
→ SecurityFilterChain checks rules
→ Matches /api/products/**
→ Requires USER or ADMIN role
→ If user has role → Allow
→ If no role → 403 Forbidden

Request: POST /api/auth/register
→ SecurityFilterChain checks rules
→ Matches /api/auth/register
→ permitAll() → Allow without authentication
```

### Interview Answer
"SecurityFilterChain is the main configuration bean for Spring Security. It configures which endpoints are public, which require authentication, and which require specific roles. In our config, we disable CSRF for REST APIs, set public endpoints for auth, configure role-based access, enable HTTP Basic auth, and use stateless session management for JWT."

---

## 2. HttpSecurity

### WHY do we need it?
- Fluent API to configure security settings
- Central place for all security configuration
- Type-safe configuration with method chaining
- Supports lambda DSL for cleaner code

### WHAT is it?
HttpSecurity is a builder class that allows configuration of web-based security. It provides methods to configure CSRF, authorization, session management, etc.

### HOW it works internally
```java
HttpSecurity http = httpSecurityBuilder
    .csrf(configurer -> configurer.disable())
    .authorizeHttpRequests(configurer -> configurer...)
    .httpBasic(configurer -> configurer...)
    .sessionManagement(configurer -> configurer...);
```

### Common Configuration Methods

| Method | Purpose | Example |
|--------|---------|---------|
| csrf() | Configure CSRF protection | csrf -> csrf.disable() |
| authorizeHttpRequests() | Configure URL authorization | auth -> auth.requestMatchers(...).permitAll() |
| httpBasic() | Configure HTTP Basic auth | httpBasic -> httpBasic.disable() |
| formLogin() | Configure form login | form -> form.loginPage("/login") |
| logout() | Configure logout | logout -> logout.logoutUrl("/logout") |
| sessionManagement() | Configure sessions | session -> session.sessionCreationPolicy(...) |
| exceptionHandling() | Configure error handling | exception -> exception.accessDeniedHandler(...) |

### Interview Answer
"HttpSecurity is a builder class for configuring web security. It provides a fluent API to configure CSRF, authorization, authentication, session management, etc. We use it in SecurityFilterChain to define our security rules using lambda DSL for cleaner code."

---

## 3. AuthenticationManager

### WHY do we need it?
- Central interface for authentication
- Delegates authentication to appropriate AuthenticationProvider
- Allows multiple authentication methods (database, LDAP, OAuth, etc.)
- Standard interface for authentication operations

### WHAT is it?
AuthenticationManager is the main Spring Security interface responsible for processing authentication requests. It delegates to one or more AuthenticationProvider instances.

### HOW it works internally
```java
public interface AuthenticationManager {
    Authentication authenticate(Authentication authentication) 
        throws AuthenticationException;
}
```

Flow:
1. Controller receives login request
2. Creates Authentication object with credentials
3. Calls authenticationManager.authenticate(authentication)
4. AuthenticationManager tries each AuthenticationProvider
5. First provider that can authenticate returns success
6. If all fail, throws AuthenticationException

### Real-Time Example
```java
// In AuthService
Authentication authentication = new UsernamePasswordAuthenticationToken(
    email, 
    password
);
Authentication authenticated = authenticationManager.authenticate(authentication);
// If successful, authenticated.isAuthenticated() = true
```

### Interview Answer
"AuthenticationManager is the main interface for authentication. It receives an Authentication object with credentials and delegates to AuthenticationProviders for validation. For example, when a user logs in, we create an Authentication object with email/password and call authenticationManager.authenticate() to validate credentials."

---

## 4. AuthenticationProvider

### WHY do we need it?
- Actual implementation of authentication logic
- Different providers for different authentication methods
- Can have multiple providers (database, LDAP, OAuth, etc.)
- Separates authentication logic from configuration

### WHAT is it?
AuthenticationProvider is an interface that defines how to authenticate a specific type of Authentication. Each provider handles a different authentication mechanism.

### HOW it works internally
```java
public interface AuthenticationProvider {
    Authentication authenticate(Authentication authentication) 
        throws AuthenticationException;
    
    boolean supports(Class<?> authentication);
}
```

Common implementations:
- DaoAuthenticationProvider: Database authentication
- LdapAuthenticationProvider: LDAP authentication
- JwtAuthenticationProvider: JWT authentication
- RememberMeAuthenticationProvider: Remember-me tokens

### DaoAuthenticationProvider Configuration
```java
@Bean
public AuthenticationProvider authenticationProvider() {
    DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
    authProvider.setUserDetailsService(customUserDetailsService);
    authProvider.setPasswordEncoder(passwordEncoder());
    return authProvider;
}
```

**Line-by-Line Explanation:**

```java
DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
```
- Creates provider for database authentication
- Uses UserDetailsService to load user data

```java
authProvider.setUserDetailsService(customUserDetailsService);
```
- Sets the service to load user details
- CustomUserDetailsService implements UserDetailsService
- Provider calls loadUserByUsername() to get user from DB

```java
authProvider.setPasswordEncoder(passwordEncoder());
```
- Sets the password encoder
- Used to encode new passwords and verify existing passwords
- We use BCryptPasswordEncoder

### Real-Time Example
```
User logs in with: john@example.com / password123

1. AuthenticationManager receives credentials
2. Delegates to DaoAuthenticationProvider
3. Provider calls CustomUserDetailsService.loadUserByUsername("john@example.com")
4. Returns User entity with encoded password
5. Provider uses PasswordEncoder.matches(password123, encodedPassword)
6. If match → Authentication successful
7. If no match → BadCredentialsException
```

### Interview Answer
"AuthenticationProvider is the actual implementation of authentication logic. DaoAuthenticationProvider uses UserDetailsService to load user data and PasswordEncoder to validate passwords. When authenticationManager.authenticate() is called, it delegates to the appropriate provider. We configure DaoAuthenticationProvider with our CustomUserDetailsService and BCryptPasswordEncoder."

---

## 5. UserDetailsService

### WHY do we need it?
- Spring Security needs a standard way to load user data
- Abstracts the data source (database, LDAP, etc.)
- Used by DaoAuthenticationProvider to get user details
- Must return UserDetails object

### WHAT is it?
UserDetailsService is an interface that defines how to load user-specific data. It has one method: loadUserByUsername().

### HOW it works internally
```java
public interface UserDetailsService {
    UserDetails loadUserByUsername(String username) 
        throws UsernameNotFoundException;
}
```

### CustomUserDetailsService Implementation
```java
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        return user; // User implements UserDetails
    }
}
```

**Line-by-Line Explanation:**

```java
public class CustomUserDetailsService implements UserDetailsService
```
- Implements UserDetailsService interface
- Spring Security automatically uses this bean
- Called by DaoAuthenticationProvider

```java
private final UserRepository userRepository;
```
- Inject UserRepository to access database
- Used to load user by email

```java
@Override
public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException
```
- Spring Security calls this method during authentication
- Parameter "username" can be email, username, or any identifier
- Must throw UsernameNotFoundException if user not found

```java
User user = userRepository.findByEmail(email)
    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
```
- Query database for user by email
- If not found, throw exception
- Spring Security handles the exception

```java
return user;
```
- Return User entity
- User entity implements UserDetails interface
- Spring Security uses this for authentication

### Real-Time Example
```
Authentication flow:
1. User submits login: john@example.com / password123
2. DaoAuthenticationProvider calls loadUserByUsername("john@example.com")
3. CustomUserDetailsService queries UserRepository
4. Returns User entity with:
   - email: john@example.com
   - password: $2a$10$encodedPassword
   - authorities: [ROLE_USER]
5. DaoAuthenticationProvider validates password
6. If valid, creates Authentication object
```

### Interview Answer
"UserDetailsService is an interface for loading user-specific data. We implement it with CustomUserDetailsService to load users from our database using UserRepository. The loadUserByUsername() method is called by DaoAuthenticationProvider during authentication. Our User entity implements UserDetails, so we return it directly."

---

## 6. UserDetails

### WHY do we need it?
- Standard interface for user data in Spring Security
- AuthenticationProvider needs user details in a standard format
- Contains authentication-relevant information
- Separates domain model from security model

### WHAT is it?
UserDetails is an interface that represents core user information. It's returned by UserDetailsService and used by Spring Security for authentication.

### HOW it works internally
```java
public interface UserDetails extends Serializable {
    Collection<? extends GrantedAuthority> getAuthorities();
    String getPassword();
    String getUsername();
    boolean isAccountNonExpired();
    boolean isAccountNonLocked();
    boolean isCredentialsNonExpired();
    boolean isEnabled();
}
```

### User Entity Implementing UserDetails
```java
@Entity
public class User implements UserDetails {

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Set.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return password; // BCrypt-encoded
    }

    @Override
    public String getUsername() {
        return email; // Using email as username
    }

    @Override
    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
```

**Method Explanations:**

```java
getAuthorities()
```
- Returns user's roles/permissions
- We convert Role enum to GrantedAuthority
- Prefix with "ROLE_" for hasRole() to work

```java
getPassword()
```
- Returns encoded password
- Never return plain-text password
- BCrypt-encoded in our case

```java
getUsername()
```
- Returns the identifier used for authentication
- Can be email, username, or any unique identifier
- We use email as username

```java
isAccountNonExpired()
```
- Whether the account has expired
- If false, authentication fails
- We store this in database

```java
isAccountNonLocked()
```
- Whether the account is locked
- If false (locked), authentication fails
- Used for account lockout after failed attempts

```java
isCredentialsNonExpired()
```
- Whether the password has expired
- If false, user must change password
- Useful for password expiration policies

```java
isEnabled()
```
- Whether the user is enabled
- If false, authentication fails
- Used for soft delete or account deactivation

### Real-Time Example
```
User tries to log in:
1. CustomUserDetailsService loads User entity
2. Spring Security checks isEnabled() → true
3. Spring Security checks isAccountNonLocked() → true
4. Spring Security checks isAccountNonExpired() → true
5. Spring Security checks isCredentialsNonExpired() → true
6. Spring Security validates password using getPassword()
7. If all checks pass → Authentication successful
```

### Interview Answer
"UserDetails is an interface that represents core user information for Spring Security. Our User entity implements UserDetails, providing methods like getAuthorities(), getPassword(), getUsername(), and account status checks. Spring Security uses these methods during authentication to validate the user's credentials and account status."

---

## 7. PasswordEncoder

### WHY do we need it?
- Never store plain-text passwords (security risk)
- Need one-way hashing (can't be reversed)
- Need salt to prevent rainbow table attacks
- Standard interface for password encoding/verification

### WHAT is it?
PasswordEncoder is an interface for encoding and verifying passwords. Spring Security provides multiple implementations.

### HOW it works internally
```java
public interface PasswordEncoder {
    String encode(CharSequence rawPassword);
    boolean matches(CharSequence rawPassword, String encodedPassword);
}
```

### BCryptPasswordEncoder
```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

**Why BCrypt?**
- Strong hashing algorithm (based on Blowfish)
- Automatically includes salt (different hash for same password)
- Configurable strength (default 10 rounds)
- Slow by design (prevents brute force)
- Industry standard for password hashing

### Real-Time Example
```java
PasswordEncoder encoder = new BCryptPasswordEncoder();

// Encoding (when registering user)
String rawPassword = "password123";
String encodedPassword = encoder.encode(rawPassword);
// Result: $2a$10$N9qo8uLOickgx2ZMRZoMy...

// Verifying (when logging in)
boolean matches = encoder.matches("password123", encodedPassword);
// Result: true

boolean wrong = encoder.matches("wrongpassword", encodedPassword);
// Result: false
```

### Usage in Application
```java
// Registration
String encodedPassword = passwordEncoder.encode(request.getPassword());
user.setPassword(encodedPassword);
userRepository.save(user);

// Login (handled by DaoAuthenticationProvider automatically)
// DaoAuthenticationProvider uses PasswordEncoder.matches()
```

### Interview Answer
"PasswordEncoder is an interface for encoding and verifying passwords. We use BCryptPasswordEncoder, which is a strong hashing algorithm with built-in salt. When a user registers, we encode their password with encoder.encode(). During login, DaoAuthenticationProvider uses encoder.matches() to verify the password. BCrypt is preferred because it's slow (prevents brute force) and includes salt automatically."

---

## 8. @EnableWebSecurity

### WHY do we need it?
- Enables Spring Security web support
- Required for web applications
- Automatically configures security filter chain
- Enables security annotations

### WHAT is it?
@EnableWebSecurity is an annotation that enables Spring Security web security support and provides the Spring MVC integration.

### HOW it works
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    // Security configuration
}
```

Without this annotation:
- Spring Security web features won't be enabled
- SecurityFilterChain beans won't be registered
- Security annotations won't work

### Interview Answer
"@EnableWebSecurity enables Spring Security web support. It's required for web applications to activate security features like SecurityFilterChain, authentication, and authorization. Without it, Spring Security won't protect our endpoints."

---

## 9. @EnableMethodSecurity

### WHY do we need it?
- Enables method-level security annotations
- Allows security checks at method level
- More fine-grained control than URL-level security
- Supports @PreAuthorize, @PostAuthorize, @Secured

### WHAT is it?
@EnableMethodSecurity enables Spring Security's method-level security annotations.

### HOW it works
```java
@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    // Security configuration
}

// Usage in service
@Service
public class UserService {
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(Long id) {
        // Only ADMIN can call this method
    }
}
```

### Supported Annotations
- @PreAuthorize: Check before method execution
- @PostAuthorize: Check after method execution
- @Secured: Simple role-based check
- @RolesAllowed: JSR-250 standard

### Real-Time Example
```java
@PreAuthorize("hasRole('ADMIN')")
public void deleteUser(Long id) {
    userRepository.deleteById(id);
}

@PreAuthorize("#userId == authentication.principal.id")
public User getProfile(Long userId) {
    return userRepository.findById(userId);
}

@PostAuthorize("returnObject.owner == authentication.principal")
public Order getOrder(Long orderId) {
    return orderRepository.findById(orderId);
}
```

### Interview Answer
"@EnableMethodSecurity enables method-level security annotations like @PreAuthorize, @PostAuthorize, and @Secured. It allows us to secure individual methods based on roles or custom expressions. For example, @PreAuthorize('hasRole('ADMIN')') ensures only ADMIN users can call that method."

---

## 10. Role-Based URL Configuration

### Configuration Examples
```java
.authorizeHttpRequests(auth -> auth
    // Public - no authentication
    .requestMatchers("/api/auth/register").permitAll()
    .requestMatchers("/api/auth/login").permitAll()
    
    // Authenticated - any logged-in user
    .requestMatchers("/api/profile").authenticated()
    
    // Specific role
    .requestMatchers("/api/admin/**").hasRole("ADMIN")
    
    // Multiple roles (any one)
    .requestMatchers("/api/products/**").hasAnyRole("USER", "ADMIN")
    
    // Specific authority
    .requestMatchers("/api/reports/**").hasAuthority("READ_REPORTS")
    
    // Multiple authorities (all required)
    .requestMatchers("/api/audit/**").hasAuthority("READ_AUDIT")
                           .hasAuthority("WRITE_AUDIT")
    
    // Custom expression
    .requestMatchers("/api/orders/my").access("hasRole('USER') and #userId == authentication.principal.id")
    
    // Default
    .anyRequest().authenticated()
)
```

### hasRole() vs hasAuthority()
```java
// hasRole() automatically adds "ROLE_" prefix
.requestMatchers("/api/admin/**").hasRole("ADMIN")
// Equivalent to: hasAuthority("ROLE_ADMIN")

// hasAuthority() checks exact string
.requestMatchers("/api/admin/**").hasAuthority("ADMIN")
// This won't match "ROLE_ADMIN"
```

### Real-Time Example
```
USER accesses /api/admin/users:
→ hasRole("ADMIN") check
→ User has "ROLE_USER"
→ Check fails
→ Returns 403 Forbidden

ADMIN accesses /api/products:
→ hasAnyRole("USER", "ADMIN") check
→ User has "ROLE_ADMIN"
→ Check passes
→ Returns products
```

### Interview Answer
"We configure role-based access using requestMatchers() with methods like hasRole(), hasAnyRole(), and hasAuthority(). hasRole() automatically adds 'ROLE_' prefix, while hasAuthority() checks the exact string. For example, hasRole('ADMIN') matches 'ROLE_ADMIN', and hasAnyRole('USER', 'ADMIN') allows users with either role."

---

## 11. Session Management

### WHY do we need it?
- Control session creation and lifecycle
- Prevent session fixation attacks
- Limit concurrent sessions
- Configure session timeout
- Support stateless authentication (JWT)

### WHAT is it?
Session management controls how HTTP sessions are created, maintained, and destroyed.

### Configuration
```java
.sessionManagement(session -> session
    .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
)
```

### SessionCreationPolicy Options

| Policy | Description | Use Case |
|--------|-------------|----------|
| ALWAYS | Always create session | Traditional web apps |
| NEVER | Never create session, use if exists | REST APIs with optional auth |
| STATELESS | Never create or use session | JWT-based REST APIs |
| IF_REQUIRED | Create session only if needed | Default behavior |

### Real-Time Example
```java
// Stateful (traditional web app)
.sessionCreationPolicy(SessionCreationPolicy.ALWAYS)
// Session created on first request
// Session ID stored in cookie
// Subsequent requests use session ID

// Stateless (JWT REST API)
.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
// No session created
// Each request authenticated independently
// JWT token sent in Authorization header
```

### Interview Answer
"Session management controls how HTTP sessions are handled. We use SessionCreationPolicy.STATELESS for JWT-based REST APIs, which means no session is created or used. Each request is authenticated independently using the JWT token. For traditional web apps, we'd use ALWAYS or IF_REQUIRED to create sessions."

---

## 12. CSRF Configuration

### WHY do we need it?
- Prevent Cross-Site Request Forgery attacks
- Protect state-changing operations (POST, PUT, DELETE)
- Default enabled in Spring Security
- Can be disabled for stateless APIs

### WHAT is it?
CSRF (Cross-Site Request Forgery) protection ensures that state-changing requests come from the actual user, not a malicious site.

### Configuration
```java
// Disable for REST APIs with JWT
.csrf(csrf -> csrf.disable())

// Enable for traditional web apps
.csrf(csrf -> csrf
    .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
)
```

### When to Disable CSRF
- REST APIs with JWT authentication
- APIs used by non-browser clients (mobile apps, CLI tools)
- Stateful services where JWT provides protection

### When to Enable CSRF
- Traditional web applications with forms
- Applications using cookie-based authentication
- Browser-based applications

### Real-Time Example
```
CSRF enabled:
POST /transfer
Must include: X-CSRF-TOKEN: abc123
Without token → 403 Forbidden

CSRF disabled (JWT):
POST /transfer
Authorization: Bearer <jwt-token>
No CSRF token needed
```

### Interview Answer
"CSRF protection prevents Cross-Site Request Forgery attacks. We disable it for REST APIs using JWT because JWT tokens provide protection. For traditional web apps with forms, we enable CSRF and require a CSRF token in state-changing requests. The token is typically stored in a cookie and sent in the request header."

---

## Complete SecurityConfig Explanation

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())                    // Line 1
            .authorizeHttpRequests(auth -> auth              // Line 2
                .requestMatchers("/api/auth/register").permitAll()  // Line 3
                .requestMatchers("/api/auth/login").permitAll()     // Line 4
                .requestMatchers("/api/public/**").permitAll()      // Line 5
                .requestMatchers("/api/products/**").hasAnyRole("USER", "ADMIN")  // Line 6
                .requestMatchers("/api/orders/**").hasAnyRole("USER", "ADMIN")    // Line 7
                .requestMatchers("/api/admin/**").hasRole("ADMIN")   // Line 8
                .anyRequest().authenticated()                 // Line 9
            )
            .httpBasic(httpBasic -> {})                       // Line 10
            .sessionManagement(session -> session             // Line 11
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)  // Line 12
            );
        return http.build();                                  // Line 13
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

**Line-by-Line Summary:**

- **Line 1**: Disable CSRF for REST APIs
- **Line 2**: Start authorization configuration
- **Lines 3-5**: Public endpoints (no auth required)
- **Lines 6-7**: USER or ADMIN can access
- **Line 8**: Only ADMIN can access
- **Line 9**: Default: require authentication
- **Line 10**: Enable HTTP Basic auth
- **Line 11**: Start session management config
- **Line 12**: Use stateless sessions (for JWT)
- **Line 13**: Build and return filter chain

---

## Next Steps

Now that we have custom base security configuration, we'll implement:
1. Database-based authentication with BCrypt (Phase 4)
2. JWT authentication (Phase 5)
3. Complete authentication flow (Phase 6)
4. Role-based authorization with method security (Phase 7)
