# Complete JWT Authentication Flow - Phase 6

## Overview

In Phase 6, we document and explain the complete end-to-end JWT authentication flow, including registration, login, subsequent API requests, and all error scenarios.

---

## 1. Registration Flow

### Flow Diagram

```
┌─────────────┐
│   Client    │
│  (Browser/  │
│   Mobile)   │
└──────┬──────┘
       │
       │ POST /api/auth/register
       │ {
       │   "email": "john@example.com",
       │   "password": "password123",
       │   "firstName": "John",
       │   "lastName": "Doe"
       │ }
       ↓
┌──────────────────────────┐
│   AuthController        │
│  @PostMapping("/register")│
└──────┬───────────────────┘
       │
       │ Calls authService.registerUser(request)
       ↓
┌──────────────────────────┐
│   AuthService            │
│  registerUser()          │
└──────┬───────────────────┘
       │
       │ Checks userRepository.existsByEmail(email)
       ↓
┌──────────────────────────┐
│   UserRepository         │
│  existsByEmail()         │
└──────┬───────────────────┘
       │
       │ SELECT COUNT(*) FROM users WHERE email = ?
       ↓
┌──────────────────────────┐
│   MySQL Database         │
│  (users table)           │
└──────┬───────────────────┘
       │
       │ Returns: false (email doesn't exist)
       ↓
┌──────────────────────────┐
│   AuthService            │
│  Creates User entity     │
└──────┬───────────────────┘
       │
       │ user.setEmail(request.getEmail())
       │ user.setPassword(passwordEncoder.encode(request.getPassword()))
       │ user.setFirstName(request.getFirstName())
       │ user.setLastName(request.getLastName())
       │ user.setRole(Role.USER)
       ↓
┌──────────────────────────┐
│   PasswordEncoder        │
│  (BCrypt)                │
└──────┬───────────────────┘
       │
       │ encode("password123")
       │ Returns: "$2a$10$N9qo8uLOickgx2ZMRZoMy..."
       ↓
┌──────────────────────────┐
│   UserRepository         │
│  save(user)              │
└──────┬───────────────────┘
       │
       │ INSERT INTO users (email, password, first_name, last_name, role, ...)
       │ VALUES ('john@example.com', '$2a$10$...', 'John', 'Doe', 'USER', ...)
       ↓
┌──────────────────────────┐
│   MySQL Database         │
│  (users table)           │
└──────┬───────────────────┘
       │
       │ Returns: saved User entity with generated ID
       ↓
┌──────────────────────────┐
│   AuthController        │
│  Creates AuthResponse   │
└──────┬───────────────────┘
       │
       │ response.setEmail(user.getEmail())
       │ response.setRole(user.getRole().name())
       │ response.setMessage("User registered successfully")
       ↓
┌─────────────┐
│   Client    │
│  HTTP 201   │
│  {          │
│   "email":  │
│   "john@example.com",    │
│   "role": "USER",        │
│   "message": "User registered successfully"│
│  }          │
└─────────────┘
```

### Step-by-Step Explanation

#### Step 1: Client Sends Registration Request
```http
POST /api/auth/register HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**WHAT happens:**
- Client (browser or mobile app) sends POST request to `/api/auth/register`
- Request body contains user registration data
- Content-Type is `application/json`

**WHY this endpoint is public:**
- Registration must be accessible to unauthenticated users
- Configured in SecurityConfig: `.requestMatchers("/api/auth/register").permitAll()`

#### Step 2: AuthController Receives Request
```java
@PostMapping("/register")
public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
    User user = authService.registerUser(request);
    AuthResponse response = new AuthResponse();
    response.setEmail(user.getEmail());
    response.setRole(user.getRole().name());
    response.setMessage("User registered successfully");
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
}
```

**WHAT happens:**
- `@Valid` triggers validation of RegisterRequest
- `@RequestBody` deserializes JSON to RegisterRequest object
- Calls `authService.registerUser(request)`
- Creates AuthResponse with user details
- Returns HTTP 201 Created

**WHY validation:**
- Ensures email format is valid
- Ensures password meets minimum length
- Ensures required fields are present

#### Step 3: AuthService Checks for Duplicate Email
```java
@Transactional
public User registerUser(RegisterRequest request) {
    if (userRepository.existsByEmail(request.getEmail())) {
        throw new RuntimeException("Email already registered");
    }
    // ... create user
}
```

**WHAT happens:**
- Calls `userRepository.existsByEmail(email)`
- If email exists, throws RuntimeException
- If email doesn't exist, continues to create user

**WHY check for duplicates:**
- Email is used as unique identifier for authentication
- Prevents multiple accounts with same email
- Maintains data integrity

#### Step 4: Password Encoding
```java
user.setPassword(passwordEncoder.encode(request.getPassword()));
```

**WHAT happens:**
- Plain-text password: "password123"
- BCrypt encoding with salt
- Encoded password: "$2a$10$N9qo8uLOickgx2ZMRZoMy..."
- Encoded password stored in database

**WHY encode:**
- Never store plain-text passwords
- BCrypt is one-way (cannot be decrypted)
- Salt prevents rainbow table attacks
- Industry standard for password hashing

#### Step 5: Save User to Database
```java
return userRepository.save(user);
```

**WHAT happens:**
- JPA generates INSERT SQL statement
- User entity saved to `users` table
- Generated ID assigned to user
- Timestamps (created_at, updated_at) set automatically

**WHY use JPA:**
- Automatic SQL generation
- Object-relational mapping
- Transaction management
- Database portability

#### Step 6: Return Response to Client
```json
{
  "email": "john@example.com",
  "role": "USER",
  "message": "User registered successfully"
}
```

**WHAT happens:**
- Response serialized to JSON
- HTTP status 201 Created
- Client receives confirmation

**WHY no token yet:**
- User just registered, not logged in
- Must explicitly login to get JWT token
- Separation of registration and authentication

### Error Scenario: Duplicate Email

```
Client sends registration with existing email
→ AuthService checks userRepository.existsByEmail()
→ Returns: true
→ Throws: RuntimeException("Email already registered")
→ GlobalExceptionHandler catches exception
→ Returns: HTTP 400 Bad Request
→ Response: {"message": "Email already registered"}
```

### Interview Answer
"Registration flow: Client sends POST to /api/auth/register with email, password, and name. AuthController validates the request and calls AuthService. AuthService checks if email exists using UserRepository. If not, it encodes the password with BCrypt, creates a User entity with USER role, and saves to database. Returns 201 Created with user details. If email exists, returns 400 Bad Request."

---

## 2. Login Flow

### Flow Diagram

```
┌─────────────┐
│   Client    │
│  (Browser/  │
│   Mobile)   │
└──────┬──────┘
       │
       │ POST /api/auth/login
       │ {
       │   "email": "john@example.com",
       │   "password": "password123"
       │ }
       ↓
┌──────────────────────────┐
│   AuthController        │
│  @PostMapping("/login")  │
└──────┬───────────────────┘
       │
       │ Calls authService.authenticateUser(request)
       ↓
┌──────────────────────────┐
│   AuthService            │
│  authenticateUser()      │
└──────┬───────────────────┘
       │
       │ Creates UsernamePasswordAuthenticationToken
       │ new UsernamePasswordAuthenticationToken(email, password)
       ↓
┌──────────────────────────┐
│   AuthenticationManager  │
│  authenticate(auth)      │
└──────┬───────────────────┘
       │
       │ Delegates to AuthenticationProvider
       ↓
┌──────────────────────────┐
│ DaoAuthenticationProvider│
└──────┬───────────────────┘
       │
       │ Calls customUserDetailsService.loadUserByUsername(email)
       ↓
┌──────────────────────────┐
│ CustomUserDetailsService │
│  loadUserByUsername()    │
└──────┬───────────────────┘
       │
       │ Calls userRepository.findByEmail(email)
       ↓
┌──────────────────────────┐
│   UserRepository         │
│  findByEmail()           │
└──────┬───────────────────┘
       │
       │ SELECT * FROM users WHERE email = ?
       ↓
┌──────────────────────────┐
│   MySQL Database         │
│  (users table)           │
└──────┬───────────────────┘
       │
       │ Returns: User entity
       │ {
       │   id: 1,
       │   email: "john@example.com",
       │   password: "$2a$10$N9qo8uLOickgx2ZMRZoMy...",
       │   role: "USER",
       │   enabled: true,
       │   ...
       │ }
       ↓
┌──────────────────────────┐
│ DaoAuthenticationProvider│
│  Validates Password      │
└──────┬───────────────────┘
       │
       │ Calls passwordEncoder.matches(rawPassword, encodedPassword)
       ↓
┌──────────────────────────┐
│   PasswordEncoder        │
│  (BCrypt)                │
└──────┬───────────────────┘
       │
       │ matches("password123", "$2a$10$N9qo8uLOickgx2ZMRZoMy...")
       │ Returns: true (password matches)
       ↓
┌──────────────────────────┐
│ DaoAuthenticationProvider│
│  Creates Authentication  │
└──────┬───────────────────┘
       │
       │ new UsernamePasswordAuthenticationToken(
       │   userDetails,
       │   null,
       │   userDetails.getAuthorities()
       │ )
       ↓
┌──────────────────────────┐
│   AuthenticationManager  │
│  Returns Authentication  │
└──────┬───────────────────┘
       │
       │ Returns authenticated Authentication object
       ↓
┌──────────────────────────┐
│   AuthService            │
│  Extracts User           │
└──────┬───────────────────┘
       │
       │ User user = (User) authenticated.getPrincipal()
       ↓
┌──────────────────────────┐
│   AuthService            │
│  Generates JWT Token     │
└──────┬───────────────────┘
       │
       │ String jwtToken = jwtService.generateToken(user)
       ↓
┌──────────────────────────┐
│   JwtService             │
│  generateToken()         │
└──────┬───────────────────┘
       │
       │ Jwts.builder()
       │   .subject(user.getEmail())  // "john@example.com"
       │   .issuedAt(new Date())
       │   .expiration(new Date(now + 24 hours))
       │   .signWith(secretKey)
       │   .compact()
       ↓
┌──────────────────────────┐
│   JWT Token Generated    │
│  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
└──────┬───────────────────┘
       │
       │ Returns token string
       ↓
┌──────────────────────────┐
│   AuthService            │
│  Creates AuthResponse   │
└──────┬───────────────────┘
       │
       │ response.setToken(jwtToken)
       │ response.setEmail(user.getEmail())
       │ response.setRole(user.getRole().name())
       ↓
┌─────────────┐
│   Client    │
│  HTTP 200   │
│  {          │
│   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",│
│   "email": "john@example.com",    │
│   "role": "USER",        │
│   "message": "Login successful"  │
│  }          │
└─────────────┘
```

### Step-by-Step Explanation

#### Step 1: Client Sends Login Request
```http
POST /api/auth/login HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**WHAT happens:**
- Client sends POST request to `/api/auth/login`
- Request body contains email and password
- Content-Type is `application/json`

**WHY this endpoint is public:**
- User must be able to login without being authenticated
- Configured in SecurityConfig: `.requestMatchers("/api/auth/login").permitAll()`

#### Step 2: AuthService Creates Authentication Token
```java
Authentication authentication = new UsernamePasswordAuthenticationToken(
    request.getEmail(),
    request.getPassword()
);
```

**WHAT happens:**
- Creates unauthenticated Authentication object
- Principal: email ("john@example.com")
- Credentials: password ("password123")
- Authorities: null (not yet authenticated)

**WHY create this token:**
- Standard Spring Security authentication request format
- Used by AuthenticationManager to process authentication
- Separates authentication logic from controller

#### Step 3: AuthenticationManager Processes Authentication
```java
Authentication authenticated = authenticationManager.authenticate(authentication);
```

**WHAT happens:**
- AuthenticationManager receives unauthenticated token
- Delegates to configured AuthenticationProvider(s)
- Tries each provider until one succeeds or all fail
- Returns authenticated Authentication object if successful
- Throws AuthenticationException if all fail

**WHY use AuthenticationManager:**
- Central interface for authentication
- Supports multiple authentication methods
- Delegates to appropriate provider
- Standard Spring Security pattern

#### Step 4: DaoAuthenticationProvider Loads User
```java
UserDetails userDetails = userDetailsService.loadUserByUsername(email);
```

**WHAT happens:**
- DaoAuthenticationProvider calls CustomUserDetailsService
- CustomUserDetailsService queries UserRepository
- UserRepository executes SQL: `SELECT * FROM users WHERE email = ?`
- Returns User entity (implements UserDetails)
- If user not found, throws UsernameNotFoundException

**WHY load from database:**
- Ensures user still exists
- Gets latest account status (enabled, locked, etc.)
- Gets latest roles/authorities
- Allows real-time account management

#### Step 5: DaoAuthenticationProvider Validates Password
```java
if (!passwordEncoder.matches(authentication.getCredentials(), userDetails.getPassword())) {
    throw new BadCredentialsException("Invalid credentials");
}
```

**WHAT happens:**
- Extracts plain-text password from authentication token
- Extracts encoded password from UserDetails
- Calls PasswordEncoder.matches() to compare
- BCrypt hashes plain-text password and compares with stored hash
- Returns true if match, false if not
- If no match, throws BadCredentialsException

**WHY use PasswordEncoder:**
- Never compare plain-text passwords
- BCrypt handles salt automatically
- One-way hashing (cannot be reversed)
- Industry standard for password validation

#### Step 6: DaoAuthenticationProvider Creates Authenticated Token
```java
return new UsernamePasswordAuthenticationToken(
    userDetails,
    null,
    userDetails.getAuthorities()
);
```

**WHAT happens:**
- Creates authenticated Authentication object
- Principal: UserDetails (User entity)
- Credentials: null (no password needed after authentication)
- Authorities: user's roles/permissions ([ROLE_USER])
- Sets authenticated flag to true

**WHY credentials is null:**
- Password no longer needed after authentication
- Prevents password from being exposed
- Standard Spring Security practice

#### Step 7: AuthService Generates JWT Token
```java
String jwtToken = jwtService.generateToken(user);
```

**WHAT happens:**
- JwtService.generateToken() called with User entity
- Creates JWT with:
  - Subject: user.getEmail() ("john@example.com")
  - Issued At: current timestamp
  - Expiration: current timestamp + 24 hours
  - Signature: HMAC-SHA256 with secret key
- Returns compact JWT string

**WHY include these claims:**
- Subject: Identifies the user
- Issued At: When token was created
- Expiration: When token becomes invalid
- Signature: Ensures token integrity

#### Step 8: Return JWT Token to Client
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  "email": "john@example.com",
  "role": "USER",
  "message": "Login successful"
}
```

**WHAT happens:**
- Response serialized to JSON
- HTTP status 200 OK
- Client receives JWT token
- Client stores token for subsequent requests

**WHY client stores token:**
- Token is used for authentication in subsequent requests
- Stored in localStorage, sessionStorage, or cookie
- Sent in Authorization header: `Bearer <token>`

### Error Scenarios

#### Scenario 1: User Not Found
```
Client sends login with non-existent email
→ CustomUserDetailsService.loadUserByUsername()
→ UserRepository.findByEmail() returns Optional.empty()
→ Throws: UsernameNotFoundException("User not found")
→ AuthenticationManager wraps in BadCredentialsException
→ AuthService catches AuthenticationException
→ Throws: RuntimeException("Invalid email or password")
→ GlobalExceptionHandler catches exception
→ Returns: HTTP 401 Unauthorized
→ Response: {"message": "Invalid email or password"}
```

**WHY generic error message:**
- Prevents information leakage
- Attacker shouldn't know if email exists
- Standard security practice

#### Scenario 2: Wrong Password
```
Client sends login with correct email but wrong password
→ User found in database
→ PasswordEncoder.matches("wrong", "$2a$10$...")
→ Returns: false
→ DaoAuthenticationProvider throws: BadCredentialsException
→ AuthService catches AuthenticationException
→ Throws: RuntimeException("Invalid email or password")
→ GlobalExceptionHandler catches exception
→ Returns: HTTP 401 Unauthorized
→ Response: {"message": "Invalid email or password"}
```

#### Scenario 3: Account Disabled
```
Client sends login with disabled account
→ User found in database
→ Password matches
→ UserDetails.isEnabled() returns: false
→ DaoAuthenticationProvider throws: DisabledException
→ AuthService catches AuthenticationException
→ Throws: RuntimeException("Account is disabled")
→ GlobalExceptionHandler catches exception
→ Returns: HTTP 401 Unauthorized
→ Response: {"message": "Account is disabled"}
```

#### Scenario 4: Account Locked
```
Client sends login with locked account
→ User found in database
→ Password matches
→ UserDetails.isAccountNonLocked() returns: false
→ DaoAuthenticationProvider throws: LockedException
→ AuthService catches AuthenticationException
→ Throws: RuntimeException("Account is locked")
→ GlobalExceptionHandler catches exception
→ Returns: HTTP 401 Unauthorized
→ Response: {"message": "Account is locked"}
```

### Interview Answer
"Login flow: Client sends email and password to /api/auth/login. AuthService creates UsernamePasswordAuthenticationToken and calls AuthenticationManager. AuthenticationManager delegates to DaoAuthenticationProvider, which loads user from database via CustomUserDetailsService and validates password using PasswordEncoder. If valid, returns authenticated Authentication object. AuthService then generates JWT token using JwtService with user's email as subject and 24-hour expiration. Returns token to client. If invalid credentials, returns 401 Unauthorized."

---

## 3. Subsequent API Request Flow

### Flow Diagram

```
┌─────────────┐
│   Client    │
│  (Browser/  │
│   Mobile)   │
└──────┬──────┘
       │
       │ GET /api/products
       │ Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
       ↓
┌──────────────────────────┐
│   Spring Security        │
│  Filter Chain            │
└──────┬───────────────────┘
       │
       │ Request passes through filters
       ↓
┌──────────────────────────┐
│ JwtAuthenticationFilter  │
│  (OncePerRequestFilter)  │
└──────┬───────────────────┘
       │
       │ Extracts Authorization header
       │ String authHeader = request.getHeader("Authorization")
       ↓
       │
       │ Checks if header starts with "Bearer "
       │ if (authHeader == null || !authHeader.startsWith("Bearer "))
       ↓
       │
       │ Extracts token from header
       │ String jwt = authHeader.substring(7)
       ↓
       │
       │ Calls jwtService.extractUsername(jwt)
       ↓
┌──────────────────────────┐
│   JwtService             │
│  extractUsername()       │
└──────┬───────────────────┘
       │
       │ Parses JWT token
       │ Validates signature
       │ Extracts subject claim
       ↓
       │
       │ Returns: "john@example.com"
       ↓
┌──────────────────────────┐
│ JwtAuthenticationFilter  │
└──────┬───────────────────┘
       │
       │ Checks if no authentication in SecurityContext
       │ if (SecurityContextHolder.getContext().getAuthentication() == null)
       ↓
       │
       │ Calls customUserDetailsService.loadUserByUsername(email)
       ↓
┌──────────────────────────┐
│ CustomUserDetailsService │
│  loadUserByUsername()    │
└──────┬───────────────────┘
       │
       │ Calls userRepository.findByEmail(email)
       ↓
┌──────────────────────────┐
│   UserRepository         │
│  findByEmail()           │
└──────┬───────────────────┘
       │
       │ SELECT * FROM users WHERE email = ?
       ↓
┌──────────────────────────┐
│   MySQL Database         │
│  (users table)           │
└──────┬───────────────────┘
       │
       │ Returns: User entity
       │ {
       │   id: 1,
       │   email: "john@example.com",
       │   password: "$2a$10$...",
       │   role: "USER",
       │   enabled: true,
       │   authorities: [ROLE_USER]
       │ }
       ↓
┌──────────────────────────┐
│ JwtAuthenticationFilter  │
└──────┬───────────────────┘
       │
       │ Calls jwtService.isTokenValid(jwt, userDetails)
       ↓
┌──────────────────────────┐
│   JwtService             │
│  isTokenValid()          │
└──────┬───────────────────┘
       │
       │ Extracts username from token
       │ String username = extractUsername(jwt)
       ↓
       │
       │ Checks if username matches
       │ username.equals(userDetails.getUsername())
       ↓
       │
       │ Checks if token is expired
       │ !isTokenExpired(jwt)
       ↓
       │
       │ Returns: true (token is valid)
       ↓
┌──────────────────────────┐
│ JwtAuthenticationFilter  │
└──────┬───────────────────┘
       │
       │ Creates UsernamePasswordAuthenticationToken
       │ new UsernamePasswordAuthenticationToken(
       │   userDetails,
       │   null,
       │   userDetails.getAuthorities()
       │ )
       ↓
       │
       │ Sets authentication details
       │ authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request))
       ↓
       │
       │ Sets authentication in SecurityContextHolder
       │ SecurityContextHolder.getContext().setAuthentication(authToken)
       ↓
       │
       │ Continues to next filter
       │ filterChain.doFilter(request, response)
       ↓
┌──────────────────────────┐
│   Spring Security        │
│  Filter Chain            │
└──────┬───────────────────┘
       │
       │ Request continues through remaining filters
       ↓
┌──────────────────────────┐
│   SecurityFilterChain    │
│  Authorization Check     │
└──────┬───────────────────┘
       │
       │ Checks URL authorization rules
       │ .requestMatchers("/api/products/**").hasAnyRole("USER", "ADMIN")
       ↓
       │
       │ Gets authentication from SecurityContextHolder
       │ Authentication auth = SecurityContextHolder.getContext().getAuthentication()
       ↓
       │
       │ Checks if user has required role
       │ if (auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_USER")))
       ↓
       │
       │ Authorization granted
       ↓
┌──────────────────────────┐
│   ProductController      │
│  @GetMapping             │
└──────┬───────────────────┘
       │
       │ public ResponseEntity<List<Product>> getAllProducts()
       ↓
       │
       │ Calls productService.getAllProducts()
       ↓
┌──────────────────────────┐
│   ProductService         │
│  getAllProducts()        │
└──────┬───────────────────┘
       │
       │ Calls productRepository.findAll()
       ↓
┌──────────────────────────┐
│   ProductRepository      │
│  findAll()               │
└──────┬───────────────────┘
       │
       │ SELECT * FROM products
       ↓
┌──────────────────────────┐
│   MySQL Database         │
│  (products table)        │
└──────┬───────────────────┘
       │
       │ Returns: List<Product>
       ↓
┌──────────────────────────┐
│   ProductController      │
└──────┬───────────────────┘
       │
       │ Returns ResponseEntity.ok(products)
       ↓
┌─────────────┐
│   Client    │
│  HTTP 200   │
│  [          │
│   {        │
│     "id": 1,│
│     "name": "Product 1",  │
│     "price": 99.99       │
│   },       │
│   {        │
│     "id": 2,│
│     "name": "Product 2",  │
│     "price": 149.99      │
│   }        │
│  ]          │
└─────────────┘
```

### Step-by-Step Explanation

#### Step 1: Client Sends API Request with JWT
```http
GET /api/products HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**WHAT happens:**
- Client sends GET request to `/api/products`
- Includes JWT token in Authorization header
- Format: `Bearer <token>`

**WHY Bearer format:**
- Standard HTTP authentication scheme
- Indicates bearer token (token holder is authenticated)
- Widely supported by clients and servers

#### Step 2: JwtAuthenticationFilter Extracts Token
```java
final String authHeader = request.getHeader("Authorization");
if (authHeader == null || !authHeader.startsWith("Bearer ")) {
    filterChain.doFilter(request, response);
    return;
}
final String jwt = authHeader.substring(7);
```

**WHAT happens:**
- Extracts Authorization header
- Checks if header exists and starts with "Bearer "
- If not, continues to next filter (no authentication)
- If yes, extracts token by removing "Bearer " prefix (7 characters)

**WHY continue if no token:**
- Public endpoints don't require token
- Filter shouldn't block public endpoints
- Authorization check happens later in filter chain

#### Step 3: JwtService Extracts Username from Token
```java
String userEmail = jwtService.extractUsername(jwt);
```

**WHAT happens:**
- JwtService parses JWT token
- Validates signature using secret key
- Extracts subject claim (user's email)
- Returns: "john@example.com"

**WHY extract username:**
- Need to identify the user
- Load user details from database
- Validate token belongs to user

#### Step 4: Load User Details from Database
```java
UserDetails userDetails = customUserDetailsService.loadUserByUsername(userEmail);
```

**WHAT happens:**
- CustomUserDetailsService queries UserRepository
- UserRepository executes SQL: `SELECT * FROM users WHERE email = ?`
- Returns User entity (implements UserDetails)
- Includes latest account status and roles

**WHY load from database:**
- Ensures user still exists
- Gets latest account status (enabled, locked, etc.)
- Gets latest roles/authorities
- Allows real-time account management

#### Step 5: Validate Token
```java
if (jwtService.isTokenValid(jwt, userDetails)) {
    // Token is valid
}
```

**WHAT happens:**
- JwtService.isTokenValid() performs checks:
  1. Extracts username from token
  2. Checks if username matches userDetails.getUsername()
  3. Checks if token is expired
  4. Validates signature
- Returns true if all checks pass

**WHY validate against UserDetails:**
- Ensures token belongs to the loaded user
- Prevents token reuse by different user
- Validates expiration

#### Step 6: Create Authentication Object
```java
UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
    userDetails,
    null,
    userDetails.getAuthorities()
);
```

**WHAT happens:**
- Creates authenticated Authentication object
- Principal: UserDetails (User entity)
- Credentials: null (no password needed)
- Authorities: user's roles/permissions ([ROLE_USER])

**WHY create this object:**
- Standard Spring Security Authentication implementation
- Required by SecurityContextHolder
- Contains all authentication information

#### Step 7: Set Authentication in SecurityContextHolder
```java
SecurityContextHolder.getContext().setAuthentication(authToken);
```

**WHAT happens:**
- Stores Authentication in thread-local SecurityContext
- Makes authentication available throughout request
- Used by authorization checks

**WHY set in SecurityContextHolder:**
- Standard Spring Security pattern
- Makes authentication available anywhere in request
- Used by @PreAuthorize, hasRole(), etc.

#### Step 8: Authorization Check
```java
.requestMatchers("/api/products/**").hasAnyRole("USER", "ADMIN")
```

**WHAT happens:**
- SecurityFilterChain checks URL authorization rules
- Gets authentication from SecurityContextHolder
- Checks if user has required role (USER or ADMIN)
- If yes, allows access to controller
- If no, returns 403 Forbidden

**WHY check authorization:**
- Enforce role-based access control
- Prevent unauthorized access to protected resources
- Separate authentication (who you are) from authorization (what you can do)

#### Step 9: Controller Processes Request
```java
@GetMapping
public ResponseEntity<List<Product>> getAllProducts() {
    return ResponseEntity.ok(productService.getAllProducts());
}
```

**WHAT happens:**
- Controller method executes
- Calls service layer
- Returns response

**WHY controller doesn't check authentication:**
- Spring Security handles authentication/authorization
- Controller focuses on business logic
- @AuthenticationPrincipal can inject user if needed

### Error Scenarios

#### Scenario 1: Token Missing
```
Client sends request without Authorization header
→ JwtAuthenticationFilter: authHeader == null
→ Continues to next filter
→ SecurityFilterChain checks authorization
→ SecurityContextHolder.getContext().getAuthentication() == null
→ Returns: HTTP 401 Unauthorized
→ Response: {"message": "Unauthorized"}
```

#### Scenario 2: Token Invalid (Wrong Format)
```
Client sends request with invalid token format
→ JwtAuthenticationFilter extracts token
→ JwtService.extractUsername() throws exception
→ Caught in try-catch block
→ Continues to next filter
→ SecurityContextHolder.getContext().getAuthentication() == null
→ Returns: HTTP 401 Unauthorized
→ Response: {"message": "Unauthorized"}
```

#### Scenario 3: Token Expired
```
Client sends request with expired token
→ JwtAuthenticationFilter extracts token
→ JwtService.extractUsername() succeeds
→ JwtService.isTokenValid() checks expiration
→ isTokenExpired() returns true
→ isTokenValid() returns false
→ Authentication not set in SecurityContextHolder
→ SecurityFilterChain checks authorization
→ Returns: HTTP 401 Unauthorized
→ Response: {"message": "Unauthorized"}
```

#### Scenario 4: User Not Found
```
Client sends request with valid token but user deleted from database
→ JwtAuthenticationFilter extracts username
→ CustomUserDetailsService.loadUserByUsername()
→ UserRepository.findByEmail() returns Optional.empty()
→ Throws: UsernameNotFoundException
→ Caught in try-catch block
→ Authentication not set in SecurityContextHolder
→ SecurityFilterChain checks authorization
→ Returns: HTTP 401 Unauthorized
→ Response: {"message": "Unauthorized"}
```

**WHY load user from database on each request:**
- Ensures user still exists
- Gets latest account status
- Allows immediate account revocation
- Trade-off: extra database query for security

#### Scenario 5: User Disabled
```
Client sends request with valid token but user disabled
→ JwtAuthenticationFilter extracts username
→ CustomUserDetailsService loads user
→ User.isEnabled() returns false
→ JwtService.isTokenValid() succeeds
→ Authentication set in SecurityContextHolder
→ SecurityFilterChain checks authorization
→ Spring Security checks isEnabled()
→ Returns: HTTP 401 Unauthorized
→ Response: {"message": "User is disabled"}
```

#### Scenario 6: Insufficient Permissions
```
USER role user tries to access /api/admin/users
→ JwtAuthenticationFilter validates token
→ Authentication set in SecurityContextHolder
→ SecurityFilterChain checks authorization
→ .requestMatchers("/api/admin/**").hasRole("ADMIN")
→ User has ROLE_USER, not ROLE_ADMIN
→ Returns: HTTP 403 Forbidden
→ Response: {"message": "Access Denied"}
```

**WHY 403 instead of 401:**
- 401: Authentication failed or missing
- 403: Authentication successful but insufficient permissions
- User is authenticated but not authorized

### Interview Answer
"Subsequent API request flow: Client sends request with JWT in Authorization header (Bearer format). JwtAuthenticationFilter extracts token, validates signature using JwtService, extracts username, loads user details from database via CustomUserDetailsService, validates token expiration and username match, creates Authentication object, and sets it in SecurityContextHolder. SecurityFilterChain then checks authorization rules. If authorized, request reaches controller. If token is missing, invalid, or expired, returns 401 Unauthorized. If user lacks permissions, returns 403 Forbidden."

---

## 4. Complete End-to-End Example

### Scenario: User Registration, Login, and API Access

#### Step 1: Register User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Response:**
```json
{
  "email": "john@example.com",
  "role": "USER",
  "message": "User registered successfully"
}
```

**Database State:**
```sql
SELECT * FROM users WHERE email = 'john@example.com';
-- Result:
-- id: 1
-- email: john@example.com
-- password: $2a$10$N9qo8uLOickgx2ZMRZoMy...
-- first_name: John
-- last_name: Doe
-- role: USER
-- enabled: true
-- account_non_expired: true
-- account_non_locked: true
-- credentials_non_expired: true
```

#### Step 2: Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MDAwODY0MDB9.abc123...",
  "email": "john@example.com",
  "role": "USER",
  "message": "Login successful"
}
```

**JWT Decoded:**
```json
// Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload
{
  "sub": "john@example.com",
  "iat": 1700000000,
  "exp": 1700086400
}

// Signature
HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

#### Step 3: Access Protected API
```bash
curl -X GET http://localhost:8080/api/products \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MDAwODY0MDB9.abc123..."
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Product 1",
    "description": "Description 1",
    "price": 99.99,
    "stock": 100
  },
  {
    "id": 2,
    "name": "Product 2",
    "description": "Description 2",
    "price": 149.99,
    "stock": 50
  }
]
```

#### Step 4: Access Admin API (Should Fail)
```bash
curl -X GET http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MDAwODY0MDB9.abc123..."
```

**Response:**
```json
{
  "timestamp": "2024-01-01T10:00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access Denied"
}
```

**WHY 403:**
- User has ROLE_USER
- Endpoint requires ROLE_ADMIN
- Authentication successful but insufficient permissions

#### Step 5: Token Expired
```bash
# Wait 24 hours for token to expire
curl -X GET http://localhost:8080/api/products \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MDAwODY0MDB9.abc123..."
```

**Response:**
```json
{
  "timestamp": "2024-01-02T10:00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Unauthorized"
}
```

**WHY 401:**
- Token expiration time passed
- JwtService.isTokenValid() returns false
- Authentication not set in SecurityContextHolder

#### Step 6: Re-login to Get New Token
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MDAwODY0MDB9.xyz789...",
  "email": "john@example.com",
  "role": "USER",
  "message": "Login successful"
}
```

**New token valid for another 24 hours.**

### Interview Answer
"Complete flow: User registers via POST /api/auth/register, password encoded with BCrypt, saved to database. User logs in via POST /api/auth/login, credentials validated, JWT token generated with 24-hour expiration. Client stores token and sends it in Authorization header (Bearer format) for subsequent requests. JwtAuthenticationFilter validates token, loads user from database, sets authentication in SecurityContextHolder. SecurityFilterChain checks authorization. If authorized, request reaches controller. If token expires, user must re-login."

---

## 5. Security Considerations

### Token Storage on Client

#### localStorage
```javascript
// Bad - vulnerable to XSS
localStorage.setItem('token', jwtToken);
```
**Risks:**
- Vulnerable to XSS attacks
- Any JavaScript can access localStorage
- Token can be stolen by malicious scripts

#### sessionStorage
```javascript
// Better - cleared when tab closes
sessionStorage.setItem('token', jwtToken);
```
**Risks:**
- Still vulnerable to XSS
- Cleared when tab closes (good for security)

#### HTTP-only Cookie
```javascript
// Best - set by server, not accessible by JavaScript
Set-Cookie: token=jwtToken; HttpOnly; Secure; SameSite=Strict
```
**Benefits:**
- Not accessible by JavaScript (XSS protection)
- Automatically sent with requests
- Secure flag ensures HTTPS only
- SameSite prevents CSRF

### HTTPS Requirement
- Always use HTTPS in production
- JWT tokens sent in plain text over HTTP
- HTTPS encrypts entire request/response
- Prevents man-in-the-middle attacks

### Token Expiration Strategy
- **Access Token**: 15-30 minutes
- **Refresh Token**: 7-30 days
- **Sliding Expiration**: Renew before expiration
- **Absolute Expiration**: Fixed expiration time

### Token Revocation
- **Blacklist**: Store revoked tokens in Redis/Database
- **Versioning**: Include version in token, increment on revocation
- **Short Expiration**: Wait for expiration (simplest)
- **Refresh Token**: Revoke refresh token to force re-login

### Interview Answer
"Security considerations: Store JWT in HTTP-only cookies to prevent XSS attacks, not localStorage. Always use HTTPS to prevent token interception. Use short-lived access tokens (15-30 minutes) with refresh tokens for longer sessions. Implement token revocation using blacklists or versioning. Never store sensitive data in JWT payload since it's base64-encoded (not encrypted)."

---

## Summary

### Complete Authentication Flow

1. **Registration**
   - Client sends email, password, name
   - Password encoded with BCrypt
   - User saved to database with USER role
   - Returns 201 Created

2. **Login**
   - Client sends email, password
   - AuthenticationManager validates credentials
   - User loaded from database
   - Password validated with BCrypt
   - JWT token generated with 24-hour expiration
   - Returns token to client

3. **Subsequent Requests**
   - Client sends token in Authorization header
   - JwtAuthenticationFilter validates token
   - User loaded from database
   - Authentication set in SecurityContextHolder
   - Authorization checked
   - Request reaches controller if authorized

### Error Handling

| Error | HTTP Status | Scenario |
|-------|-------------|----------|
| Duplicate email | 400 Bad Request | Registration with existing email |
| Invalid credentials | 401 Unauthorized | Wrong email or password |
| User not found | 401 Unauthorized | Email doesn't exist |
| Account disabled | 401 Unauthorized | User account disabled |
| Account locked | 401 Unauthorized | User account locked |
| Token missing | 401 Unauthorized | No Authorization header |
| Token invalid | 401 Unauthorized | Invalid token format |
| Token expired | 401 Unauthorized | Token expiration passed |
| Insufficient permissions | 403 Forbidden | User lacks required role |

### Key Components

- **JwtService**: Generate and validate JWT tokens
- **JwtAuthenticationFilter**: Validate JWT on each request
- **CustomUserDetailsService**: Load user from database
- **SecurityContextHolder**: Store authentication
- **SecurityFilterChain**: Configure authorization rules

### Next Steps

With complete JWT authentication flow documented, we'll implement:
1. Role-Based Authorization with method security (Phase 7)
2. Microservices Security with API Gateway (Phase 8)
3. Real-Time Project Implementation (Phase 9)
