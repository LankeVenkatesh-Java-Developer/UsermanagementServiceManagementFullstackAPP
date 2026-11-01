# Database-Based Authentication - Phase 4

## Overview

In Phase 4, we implement complete user authentication using MySQL database and Spring Data JPA. Users are stored in the database with BCrypt-hashed passwords, and Spring Security loads user details during authentication.

---

## 1. User Entity with UserDetails

### WHY do we need it?
- Store user information in database
- Implement UserDetails interface for Spring Security
- Support multiple roles (USER, ADMIN)
- Track account status (enabled, locked, expired)
- Never store plain-text passwords

### WHAT is it?
User entity that implements UserDetails interface, allowing it to be used directly by Spring Security for authentication.

### Implementation
```java
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;  // BCrypt-encoded

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private Boolean enabled = true;

    @Column(nullable = false)
    private Boolean accountNonExpired = true;

    @Column(nullable = false)
    private Boolean accountNonLocked = true;

    @Column(nullable = false)
    private Boolean credentialsNonExpired = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Set.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;  // Using email as username
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

### Field Explanations

| Field | Purpose | Security Relevance |
|-------|---------|-------------------|
| email | Unique identifier | Used as username for authentication |
| password | BCrypt-encoded password | Never store plain-text |
| role | User's role (USER/ADMIN) | Used for authorization |
| enabled | Account active status | If false, login fails |
| accountNonExpired | Account expiration | If false, login fails |
| accountNonLocked | Account lock status | If false, login fails (e.g., after failed attempts) |
| credentialsNonExpired | Password expiration | If false, user must change password |

### Real-Time Example
```sql
INSERT INTO users (email, password, first_name, last_name, role, enabled, account_non_expired, account_non_locked, credentials_non_expired)
VALUES ('john@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy...', 'John', 'Doe', 'USER', true, true, true, true);
```

### Interview Answer
"Our User entity implements UserDetails to work with Spring Security. It stores email as username, BCrypt-encoded password, role, and account status flags. The getAuthorities() method returns the user's role as a GrantedAuthority. Spring Security checks the account status flags during authentication to determine if the user can log in."

---

## 2. Role Entity (Enum)

### WHY do we need it?
- Define available roles in the system
- Type-safe role management
- Easy to extend with new roles
- Used for authorization decisions

### WHAT is it?
A Java enum representing user roles in the system.

### Implementation
```java
public enum Role {
    USER,
    ADMIN
}
```

### Real-Time Example
```java
// Setting role during registration
user.setRole(Role.USER);

// Checking role in authorization
if (user.getRole() == Role.ADMIN) {
    // User is admin
}
```

### Interview Answer
"We use a Role enum to define available roles in the system (USER, ADMIN). Enums provide type safety and make it easy to manage roles. The role is stored in the database as a string and converted to the enum by JPA. We use it for authorization decisions in SecurityConfig and method-level security."

---

## 3. UserRepository

### WHY do we need it?
- Access user data from database
- Find user by email for authentication
- Check if email already exists (registration)
- Standard Spring Data JPA repository

### WHAT is it?
Spring Data JPA repository interface for User entity.

### Implementation
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

### Method Explanations

```java
Optional<User> findByEmail(String email)
```
- Finds user by email
- Returns Optional to handle not-found case
- Used by CustomUserDetailsService during authentication

```java
boolean existsByEmail(String email)
```
- Checks if email already exists
- Used during registration to prevent duplicates
- Returns true if email exists, false otherwise

### Real-Time Example
```java
// Authentication
Optional<User> user = userRepository.findByEmail("john@example.com");
if (user.isPresent()) {
    // User found, validate password
}

// Registration
if (userRepository.existsByEmail("john@example.com")) {
    throw new RuntimeException("Email already registered");
}
```

### Interview Answer
"UserRepository is a Spring Data JPA repository for User entity. It provides methods like findByEmail() to load users during authentication and existsByEmail() to check for duplicate emails during registration. Spring Data JPA automatically implements these methods based on the method names."

---

## 4. CustomUserDetailsService

### WHY do we need it?
- Bridge between Spring Security and our database
- Load user details by email/username
- Implement UserDetailsService interface
- Called by DaoAuthenticationProvider

### WHAT is it?
Service that implements UserDetailsService to load user-specific data from database.

### Implementation
```java
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
        return user;  // User implements UserDetails
    }
}
```

### Flow During Authentication

```
1. User submits login: john@example.com / password123
2. DaoAuthenticationProvider receives credentials
3. Calls loadUserByUsername("john@example.com")
4. CustomUserDetailsService queries UserRepository
5. UserRepository.findByEmail() returns User entity
6. User entity implements UserDetails
7. DaoAuthenticationProvider validates password using PasswordEncoder
8. If valid, creates Authentication object
9. If invalid, throws BadCredentialsException
```

### Real-Time Example
```java
// Called internally by Spring Security
UserDetails userDetails = customUserDetailsService.loadUserByUsername("john@example.com");
// Returns: User entity with email, encoded password, authorities, account status
```

### Interview Answer
"CustomUserDetailsService implements UserDetailsService to load users from our database. The loadUserByUsername() method is called by DaoAuthenticationProvider during authentication. We query UserRepository to find the user by email and return the User entity (which implements UserDetails). If the user is not found, we throw UsernameNotFoundException."

---

## 5. PasswordEncoder Configuration

### WHY do we need it?
- Encode passwords before storing in database
- Validate passwords during login
- Never store or compare plain-text passwords
- Use strong hashing algorithm (BCrypt)

### WHAT is it?
PasswordEncoder bean that uses BCrypt algorithm for password hashing.

### Implementation
```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

### BCrypt Features
- One-way hashing (cannot be reversed)
- Built-in salt (different hash for same password)
- Configurable strength (default 10 rounds)
- Slow by design (prevents brute force)
- Industry standard

### Real-Time Example
```java
PasswordEncoder encoder = new BCryptPasswordEncoder();

// Registration - encode password
String rawPassword = "password123";
String encodedPassword = encoder.encode(rawPassword);
// Result: $2a$10$N9qo8uLOickgx2ZMRZoMy...

// Login - validate password
boolean matches = encoder.matches("password123", encodedPassword);
// Result: true

boolean wrong = encoder.matches("wrongpassword", encodedPassword);
// Result: false
```

### Usage in UserService
```java
@Transactional
public User registerUser(RegisterRequest request) {
    if (userRepository.existsByEmail(request.getEmail())) {
        throw new RuntimeException("Email already registered");
    }

    User user = new User();
    user.setEmail(request.getEmail());
    user.setPassword(passwordEncoder.encode(request.getPassword()));  // Encode!
    user.setFirstName(request.getFirstName());
    user.setLastName(request.getLastName());
    user.setRole(Role.USER);
    
    return userRepository.save(user);
}
```

### Interview Answer
"We configure BCryptPasswordEncoder as a PasswordEncoder bean. BCrypt is a strong hashing algorithm with built-in salt. During registration, we encode the password with encoder.encode() before saving to database. During login, DaoAuthenticationProvider uses encoder.matches() to validate the password. BCrypt is preferred because it's slow (prevents brute force) and includes salt automatically."

---

## 6. AuthenticationProvider Configuration

### WHY do we need it?
- Connect UserDetailsService and PasswordEncoder
- Validate authentication requests
- Use database for user data
- Standard Spring Security authentication flow

### WHAT is it?
DaoAuthenticationProvider bean that uses our CustomUserDetailsService and PasswordEncoder.

### Implementation
```java
@Bean
public AuthenticationProvider authenticationProvider() {
    DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
    authProvider.setUserDetailsService(customUserDetailsService);
    authProvider.setPasswordEncoder(passwordEncoder());
    return authProvider;
}
```

### Line-by-Line Explanation

```java
DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
```
- Creates provider for database authentication
- Standard Spring Security provider for DAO-based auth

```java
authProvider.setUserDetailsService(customUserDetailsService);
```
- Sets the service to load user details
- CustomUserDetailsService will be called during authentication

```java
authProvider.setPasswordEncoder(passwordEncoder());
```
- Sets the password encoder
- Used to validate passwords during authentication

```java
return authProvider;
```
- Returns the configured provider
- Spring Security registers it automatically

### Real-Time Example
```
Authentication flow with DaoAuthenticationProvider:

1. User submits: john@example.com / password123
2. AuthenticationManager receives request
3. Delegates to DaoAuthenticationProvider
4. DaoAuthenticationProvider calls CustomUserDetailsService.loadUserByUsername("john@example.com")
5. Returns User entity with encoded password
6. DaoAuthenticationProvider uses PasswordEncoder.matches("password123", encodedPassword)
7. If match → Authentication successful
8. If no match → BadCredentialsException
```

### Interview Answer
"We configure DaoAuthenticationProvider with our CustomUserDetailsService and PasswordEncoder. During authentication, the provider calls CustomUserDetailsService to load the user from the database and PasswordEncoder to validate the password. DaoAuthenticationProvider is the standard Spring Security provider for database-based authentication."

---

## 7. AuthenticationManager Configuration

### WHY do we need it?
- Central interface for authentication
- Used in AuthService to authenticate users
- Delegates to AuthenticationProvider
- Standard Spring Security authentication entry point

### WHAT is it?
AuthenticationManager bean configured from AuthenticationConfiguration.

### Implementation
```java
@Bean
public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
    return config.getAuthenticationManager();
}
```

### Usage in AuthService
```java
@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;

    public AuthResponse authenticateUser(LoginRequest request) {
        // Create authentication token
        Authentication authentication = new UsernamePasswordAuthenticationToken(
            request.getEmail(),
            request.getPassword()
        );

        // Authenticate
        Authentication authenticated = authenticationManager.authenticate(authentication);

        // Get authenticated user
        User user = (User) authenticated.getPrincipal();

        // Return response
        return new AuthResponse(user.getEmail(), user.getRole().name());
    }
}
```

### Real-Time Example
```
Login request:
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

Flow:
1. AuthController receives request
2. Calls AuthService.authenticateUser()
3. AuthService creates UsernamePasswordAuthenticationToken
4. Calls authenticationManager.authenticate()
5. AuthenticationManager delegates to DaoAuthenticationProvider
6. DaoAuthenticationProvider loads user from database
7. Validates password with BCrypt
8. Returns authenticated Authentication object
9. Extracts User from Authentication
10. Returns success response
```

### Interview Answer
"AuthenticationManager is the main interface for authentication. We configure it as a bean using AuthenticationConfiguration. In AuthService, we create a UsernamePasswordAuthenticationToken with credentials and call authenticationManager.authenticate(). The manager delegates to DaoAuthenticationProvider, which loads the user from database and validates the password."

---

## 8. Complete Database Authentication Flow

### Registration Flow

```
Client
  ↓ POST /api/auth/register
  ↓ {email, password, firstName, lastName}
AuthController
  ↓ Calls AuthService.registerUser()
AuthService
  ↓ Checks if email exists
  ↓ If exists → throw exception
  ↓ If not exists → encode password
UserService
  ↓ Creates User entity
  ↓ Sets BCrypt-encoded password
  ↓ Sets role to USER
  ↓ Saves to database
MySQL
  ↓ INSERT INTO users
Response
  ↓ 201 Created
  ↓ {email, role, message}
```

### Login Flow

```
Client
  ↓ POST /api/auth/login
  ↓ {email, password}
AuthController
  ↓ Calls AuthService.authenticateUser()
AuthService
  ↓ Creates UsernamePasswordAuthenticationToken
  ↓ Calls authenticationManager.authenticate()
AuthenticationManager
  ↓ Delegates to DaoAuthenticationProvider
DaoAuthenticationProvider
  ↓ Calls CustomUserDetailsService.loadUserByUsername()
CustomUserDetailsService
  ↓ Queries UserRepository.findByEmail()
UserRepository
  ↓ SELECT * FROM users WHERE email = ?
  ↓ Returns User entity
CustomUserDetailsService
  ↓ Returns User (implements UserDetails)
DaoAuthenticationProvider
  ↓ Calls PasswordEncoder.matches(rawPassword, encodedPassword)
PasswordEncoder
  ↓ Validates BCrypt hash
  ↓ Returns true/false
DaoAuthenticationProvider
  ↓ If valid → creates Authentication object
  ↓ If invalid → throws BadCredentialsException
AuthenticationManager
  ↓ Returns Authentication (if successful)
AuthService
  ↓ Extracts User from Authentication
  ↓ Creates AuthResponse
Response
  ↓ 200 OK
  ↓ {email, role, message}
```

### Error Scenarios

| Scenario | Error | HTTP Status |
|----------|-------|-------------|
| Email not found | UsernameNotFoundException | 401 Unauthorized |
| Wrong password | BadCredentialsException | 401 Unauthorized |
| Duplicate email | RuntimeException | 400 Bad Request |
| Account disabled | DisabledException | 401 Unauthorized |
| Account locked | LockedException | 401 Unauthorized |
| Password expired | CredentialsExpiredException | 401 Unauthorized |

### Interview Answer
"During registration, we check if the email exists, encode the password with BCrypt, create a User entity with USER role, and save to database. During login, we create an authentication token and call authenticationManager.authenticate(). The manager delegates to DaoAuthenticationProvider, which loads the user from database via CustomUserDetailsService and validates the password using PasswordEncoder. If valid, authentication succeeds; otherwise, BadCredentialsException is thrown."

---

## 9. Handling Duplicate Email Registration

### WHY do we need it?
- Prevent multiple accounts with same email
- Email is used as unique identifier
- Avoid data integrity issues
- Provide clear error message to user

### Implementation
```java
@Transactional
public User registerUser(RegisterRequest request) {
    if (userRepository.existsByEmail(request.getEmail())) {
        throw new RuntimeException("Email already registered");
    }

    User user = new User();
    user.setEmail(request.getEmail());
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    user.setFirstName(request.getFirstName());
    user.setLastName(request.getLastName());
    user.setRole(Role.USER);
    
    return userRepository.save(user);
}
```

### Real-Time Example
```
First registration:
POST /api/auth/register
{email: "john@example.com", password: "password123"}
→ Success: User created

Second registration with same email:
POST /api/auth/register
{email: "john@example.com", password: "different"}
→ Error: "Email already registered"
→ HTTP 400 Bad Request
```

### Interview Answer
"We handle duplicate email registration by checking userRepository.existsByEmail() before creating a user. If the email exists, we throw a RuntimeException with a clear message. This prevents multiple accounts with the same email and maintains data integrity. The GlobalExceptionHandler catches this exception and returns a 400 Bad Request response."

---

## 10. Handling Invalid Credentials

### WHY do we need it?
- Prevent unauthorized access
- Provide clear error message
- Log failed attempts (optional)
- Trigger account lockout after multiple failures (optional)

### Implementation
```java
public AuthResponse authenticateUser(LoginRequest request) {
    try {
        Authentication authentication = new UsernamePasswordAuthenticationToken(
            request.getEmail(),
            request.getPassword()
        );
        
        Authentication authenticated = authenticationManager.authenticate(authentication);
        User user = (User) authenticated.getPrincipal();
        
        AuthResponse response = new AuthResponse();
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());
        response.setMessage("Login successful");
        
        return response;
        
    } catch (AuthenticationException e) {
        throw new RuntimeException("Invalid email or password");
    }
}
```

### Real-Time Example
```
Valid credentials:
POST /api/auth/login
{email: "john@example.com", password: "password123"}
→ Success: 200 OK

Invalid password:
POST /api/auth/login
{email: "john@example.com", password: "wrong"}
→ Error: "Invalid email or password"
→ HTTP 401 Unauthorized

Non-existent email:
POST /api/auth/login
{email: "unknown@example.com", password: "password"}
→ Error: "Invalid email or password"
→ HTTP 401 Unauthorized
```

### Interview Answer
"We handle invalid credentials by wrapping the authenticationManager.authenticate() call in a try-catch block. If AuthenticationException is thrown (which includes BadCredentialsException, UsernameNotFoundException, etc.), we throw a RuntimeException with a generic 'Invalid email or password' message. This prevents information leakage about which part is wrong (email or password)."

---

## 11. Handling Disabled or Locked Accounts

### WHY do we need it?
- Soft delete users without deleting from database
- Lock accounts after suspicious activity
- Temporarily disable accounts
- Enforce account policies

### Implementation in User Entity
```java
@Column(nullable = false)
private Boolean enabled = true;

@Column(nullable = false)
private Boolean accountNonLocked = true;

@Override
public boolean isEnabled() {
    return enabled;
}

@Override
public boolean isAccountNonLocked() {
    return accountNonLocked;
}
```

### Real-Time Example
```java
// Disable user account
User user = userRepository.findById(userId);
user.setEnabled(false);
userRepository.save(user);

// Try to login with disabled account
POST /api/auth/login
{email: "john@example.com", password: "password123"}
→ Error: "User is disabled"
→ HTTP 401 Unauthorized

// Lock user account
User user = userRepository.findById(userId);
user.setAccountNonLocked(false);
userRepository.save(user);

// Try to login with locked account
POST /api/auth/login
{email: "john@example.com", password: "password123"}
→ Error: "User account is locked"
→ HTTP 401 Unauthorized
```

### Interview Answer
"We handle disabled and locked accounts using the enabled and accountNonLocked fields in the User entity. These fields are checked by Spring Security during authentication via the isEnabled() and isAccountNonLocked() methods. If a user is disabled or locked, authentication fails with DisabledException or LockedException. We can use this for soft deletes, account lockout after failed attempts, or temporary suspensions."

---

## 12. Complete Database Authentication Architecture

### Architecture Diagram

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP Request
       ↓
┌──────────────────┐
│ AuthController  │
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│   AuthService    │
└──────┬───────────┘
       │
       ↓
┌──────────────────────────┐
│ AuthenticationManager   │
└──────┬───────────────────┘
       │
       ↓
┌─────────────────────────────┐
│ DaoAuthenticationProvider  │
└──────┬──────────────────────┘
       │
       ├──────────────────────┐
       ↓                      ↓
┌──────────────────┐  ┌──────────────────┐
│CustomUserDetails │  │ PasswordEncoder  │
│    Service       │  │  (BCrypt)        │
└──────┬───────────┘  └──────────────────┘
       │
       ↓
┌──────────────────┐
│ UserRepository   │
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│   MySQL DB       │
│   (users table)  │
└──────────────────┘
```

### Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| AuthController | Receives HTTP requests, calls AuthService |
| AuthService | Creates authentication token, calls AuthenticationManager |
| AuthenticationManager | Delegates to AuthenticationProvider |
| DaoAuthenticationProvider | Loads user, validates password |
| CustomUserDetailsService | Loads user from database |
| PasswordEncoder | Encodes/validates passwords |
| UserRepository | Database access for User entity |
| MySQL DB | Stores user data with BCrypt passwords |

### Interview Answer
"Our database authentication architecture follows Spring Security's standard flow. The AuthController receives login requests and calls AuthService. AuthService creates an authentication token and calls AuthenticationManager, which delegates to DaoAuthenticationProvider. The provider uses CustomUserDetailsService to load the user from database via UserRepository and PasswordEncoder to validate the BCrypt-encoded password. If valid, the user is authenticated."

---

## 13. Security Best Practices

### Password Storage
✅ **DO:**
- Use BCryptPasswordEncoder
- Never store plain-text passwords
- Encode passwords before saving to database
- Use strong password policies (min length, complexity)

❌ **DON'T:**
- Store plain-text passwords
- Use weak hashing (MD5, SHA-1)
- Use reversible encryption
- Hardcode passwords in code

### User Identification
✅ **DO:**
- Use email as username (unique identifier)
- Validate email format
- Check for duplicate emails during registration
- Use case-insensitive email comparison

❌ **DON'T:**
- Use non-unique identifiers
- Skip email validation
- Allow duplicate emails
- Use case-sensitive email comparison

### Account Status
✅ **DO:**
- Implement account status flags (enabled, locked, expired)
- Use soft delete instead of hard delete
- Lock accounts after multiple failed attempts
- Log authentication failures

❌ **DON'T:**
- Ignore account status
- Hard delete user records
- Allow unlimited failed login attempts
- Skip error logging

### Error Handling
✅ **DO:**
- Use generic error messages for invalid credentials
- Don't reveal if email exists or password is wrong
- Log detailed errors server-side
- Use proper HTTP status codes (401, 403, 400)

❌ **DON'T:**
- Reveal specific error details to client
- Use same status for all errors
- Skip error logging
- Return stack traces to client

### Interview Answer
"We follow security best practices for database authentication: use BCrypt for password hashing (never plain-text), encode passwords before saving, use email as unique identifier with validation, implement account status flags for soft delete and lockout, use generic error messages to prevent information leakage, and log errors server-side. We never store plain-text passwords or use weak hashing algorithms."

---

## Summary

### Key Components Implemented
1. **User Entity** - Implements UserDetails, stores user data with BCrypt passwords
2. **Role Enum** - Defines available roles (USER, ADMIN)
3. **UserRepository** - Database access for User entity
4. **CustomUserDetailsService** - Loads user from database for authentication
5. **PasswordEncoder** - BCrypt password encoding/verification
6. **AuthenticationProvider** - DaoAuthenticationProvider with custom UserDetailsService
7. **AuthenticationManager** - Central authentication interface
8. **AuthService** - Business logic for registration and login

### Database Schema
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL,
    account_non_expired BOOLEAN NOT NULL,
    account_non_locked BOOLEAN NOT NULL,
    credentials_non_expired BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);
```

### Next Steps
With database authentication complete, we'll implement:
1. JWT Authentication (Phase 5)
2. Complete JWT Authentication Flow (Phase 6)
3. Role-Based Authorization (Phase 7)
