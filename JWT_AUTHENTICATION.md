# JWT Authentication - Phase 5

## Overview

In Phase 5, we implement JWT (JSON Web Token) based authentication from scratch. JWT provides a stateless, scalable authentication mechanism suitable for REST APIs and microservices.

---

## 1. What is JWT?

### WHY do we need it?
- Stateless authentication - no server-side session storage
- Scalable - works well in distributed systems and microservices
- Cross-domain support - can be used across different domains
- Mobile-friendly - easy to use in mobile apps
- Self-contained - contains all user information needed

### WHAT is it?
JWT (JSON Web Token) is a compact, URL-safe means of representing claims to be transferred between two parties. It's an open standard (RFC 7519) for securely transmitting information between parties as a JSON object.

### HOW it works
JWT is a string consisting of three parts separated by dots:
```
header.payload.signature
```

Example:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Real-Time Example
```
Login Request:
POST /api/auth/login
{email: "john@example.com", password: "password123"}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  "email": "john@example.com",
  "role": "USER"
}

Subsequent Request:
GET /api/products
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Interview Answer
"JWT (JSON Web Token) is a compact, URL-safe token used for stateless authentication. It consists of three parts: header, payload, and signature. JWT is self-contained, meaning it carries all user information needed for authentication. We use JWT for REST APIs because it's stateless, scalable, and works well in microservices architectures."

---

## 2. Why JWT Instead of Session-Based Authentication?

### Comparison Table

| Aspect | Session-Based | JWT-Based |
|--------|---------------|-----------|
| Storage | Server-side session storage | Client-side token storage |
| Scalability | Requires session replication | No server storage needed |
| State | Stateful | Stateless |
| Cross-domain | Difficult (CORS issues) | Easy (token in header) |
| Mobile | Cookie issues | Easy (token in header) |
| Revocation | Easy (invalidate session) | Difficult (wait for expiration) |
| Size | Small (session ID only) | Larger (contains user data) |
| Security | Server controls session | Client must protect token |

### WHY JWT for REST APIs?
- **Stateless**: No session storage, easier to scale horizontally
- **Microservices**: Each service can validate token independently
- **Mobile**: No cookie issues, easy to store in secure storage
- **Cross-Origin**: Works across different domains
- **Performance**: No database lookup for session validation

### WHEN to use Session-Based?
- Traditional web applications with forms
- Need immediate token revocation
- Session data is large (don't want in JWT)
- Regulatory requirements (session invalidation)

### Interview Answer
"JWT is preferred over session-based authentication for REST APIs because it's stateless and scalable. With sessions, you need server-side storage and replication in distributed systems. JWT carries all user information in the token, so any service can validate it independently. However, sessions are better when you need immediate revocation or have large session data."

---

## 3. JWT Structure

### Three Parts of JWT

```
Header.Payload.Signature
```

#### 1. Header
Contains metadata about the token:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```
- **alg**: Algorithm used for signing (HS256, RS256, etc.)
- **typ**: Token type (usually "JWT")

Base64URL encoded:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

#### 2. Payload
Contains claims (user information):
```json
{
  "sub": "john@example.com",
  "role": "USER",
  "iat": 1516239022,
  "exp": 1516325422
}
```
Standard claims:
- **sub** (Subject): User identifier (email, username)
- **iat** (Issued At): Token creation timestamp
- **exp** (Expiration): Token expiration timestamp
- **iss** (Issuer): Who issued the token
- **aud** (Audience): Who the token is for

Custom claims:
- **role**: User's role
- **permissions**: User's permissions
- Any other user data

Base64URL encoded:
```
eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyfQ
```

#### 3. Signature
Cryptographic signature to verify token integrity:
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```
Signature:
```
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Complete JWT
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Interview Answer
"JWT consists of three parts: header, payload, and signature. The header contains the algorithm and token type. The payload contains claims like subject (user ID), issued at, and expiration. The signature is created by signing the header and payload with a secret key. The signature ensures the token hasn't been tampered with."

---

## 4. What is Base64URL Encoding?

### WHY do we need it?
- JWT must be URL-safe (no special characters)
- Base64 uses characters like +, /, = which are problematic in URLs
- Base64URL replaces these with URL-safe characters

### WHAT is it?
Base64URL is a variant of Base64 encoding that replaces:
- `+` with `-`
- `/` with `_`
- Removes trailing `=`

### Comparison
```
Base64: SGVsbG8gV29ybGQ=
Base64URL: SGVsbG8gV29ybGQ
```

### Real-Time Example
```java
// Standard Base64
String base64 = Base64.getEncoder().encodeToString("Hello World".getBytes());
// Result: SGVsbG8gV29ybGQ=

// Base64URL
String base64Url = Base64.getUrlEncoder().encodeToString("Hello World".getBytes());
// Result: SGVsbG8gV29ybGQ
```

### Interview Answer
"Base64URL encoding is a URL-safe variant of Base64. It replaces '+' with '-', '/' with '_', and removes trailing '='. This makes JWT tokens safe to use in URLs and HTTP headers. Standard Base64 has characters that are problematic in URLs, so Base64URL is used for JWT."

---

## 5. What is JWT Signing?

### WHY do we need it?
- Verify token hasn't been tampered with
- Ensure token was issued by trusted server
- Prevent token forgery
- Maintain integrity of claims

### WHAT is it?
Signing is the process of creating a cryptographic signature using the header, payload, and a secret key (or private key for asymmetric algorithms).

### HOW it works
```
Signature = HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret_key
)
```

### Symmetric vs Asymmetric Signing

| Type | Algorithm | Key | Use Case |
|------|-----------|-----|----------|
| Symmetric | HS256 | Shared secret | Single service, simpler |
| Asymmetric | RS256 | Private/Public key pair | Multiple services, more secure |

### Symmetric (HS256) - Our Implementation
```
Signing: Server uses secret key
Verification: Server uses same secret key
```

### Asymmetric (RS256)
```
Signing: Server uses private key
Verification: Any service uses public key
```

### Real-Time Example
```java
// Signing (server-side)
String signature = Jwts.builder()
    .setHeader(header)
    .setPayload(payload)
    .signWith(secretKey, SignatureAlgorithm.HS256)
    .compact();

// Verification (server-side)
Claims claims = Jwts.parserBuilder()
    .setSigningKey(secretKey)
    .build()
    .parseClaimsJws(token)
    .getBody();
```

### Interview Answer
"JWT signing creates a cryptographic signature using the header, payload, and a secret key. This signature verifies that the token hasn't been tampered with and was issued by a trusted server. We use symmetric signing (HS256) with a shared secret key. For verification, the same key is used to validate the signature."

---

## 6. What is JWT Expiration?

### WHY do we need it?
- Limit token lifetime for security
- Force periodic re-authentication
- Reduce impact of token theft
- Allow revocation through expiration

### WHAT is it?
Expiration is a timestamp after which the token is no longer valid. It's stored in the `exp` claim.

### HOW it works
```java
// Set expiration to 24 hours from now
long expirationTime = System.currentTimeMillis() + 24 * 60 * 60 * 1000; // 24 hours
Date expirationDate = new Date(expirationTime);

String token = Jwts.builder()
    .setExpiration(expirationDate)
    .signWith(secretKey)
    .compact();
```

### Expiration Check
```java
// During validation
Date expiration = claims.getExpiration();
if (expiration.before(new Date())) {
    throw new ExpiredJwtException("Token has expired");
}
```

### Real-Time Example
```
Token issued at: 2024-01-01 10:00:00
Expiration: 2024-01-02 10:00:00 (24 hours)

Request at 2024-01-01 15:00:00 → Token valid
Request at 2024-01-02 11:00:00 → Token expired
```

### Best Practices
- **Access Token**: Short-lived (15-30 minutes)
- **Refresh Token**: Longer-lived (7-30 days)
- **Sliding Expiration**: Renew token before expiration
- **Absolute Expiration**: Fixed expiration time

### Interview Answer
"JWT expiration is a timestamp after which the token becomes invalid. We set the `exp` claim to a future date (e.g., 24 hours). During validation, we check if the current time is before the expiration. If expired, the token is rejected. Short-lived access tokens (15-30 minutes) are recommended for security, with refresh tokens for longer sessions."

---

## 7. Access Token vs Refresh Token

### Comparison Table

| Aspect | Access Token | Refresh Token |
|--------|--------------|---------------|
| Purpose | Access protected resources | Obtain new access tokens |
| Lifetime | Short (15-30 minutes) | Long (7-30 days) |
| Storage | Memory, localStorage | HTTP-only cookie, secure storage |
| Contains | User claims, permissions | Minimal data (just ID) |
| Revocation | Wait for expiration | Can be revoked immediately |
| Usage | Every API request | Only when access token expires |

### WHY both tokens?
- **Access Token**: Short-lived for security
- **Refresh Token**: Long-lived for user experience
- **Compromise**: Security + usability

### Flow
```
1. User logs in → Receive access token (15 min) + refresh token (7 days)
2. Use access token for API calls
3. After 15 minutes → Access token expires
4. Use refresh token to get new access token
5. Continue using new access token
6. After 7 days → Refresh token expires → User must log in again
```

### Real-Time Example
```
Login Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // 15 min
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // 7 days
  "expiresIn": 900
}

API Request (with access token):
GET /api/products
Authorization: Bearer <access_token>

Access Token Expired → Use Refresh Token:
POST /api/auth/refresh
{refreshToken: "<refresh_token>"}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // New access token
  "expiresIn": 900
}
```

### Interview Answer
"Access tokens are short-lived (15-30 minutes) and used for API requests. Refresh tokens are long-lived (7-30 days) and used to obtain new access tokens when they expire. This provides security (short-lived access tokens) and user experience (long-lived refresh tokens). If an access token is stolen, it's only valid for a short time."

---

## 8. JWT Advantages and Limitations

### Advantages

✅ **Stateless**
- No server-side session storage
- Easy to scale horizontally
- Reduced server memory usage

✅ **Cross-Domain Support**
- Works across different domains
- No CORS issues with cookies
- Easy to use in SPAs and mobile apps

✅ **Self-Contained**
- Contains all user information
- No database lookup for validation
- Fast validation

✅ **Standard**
- Open standard (RFC 7519)
- Wide library support
- Language-agnostic

✅ **Performance**
- No database round-trip for validation
- Cryptographic validation is fast
- Reduces server load

### Limitations

❌ **Token Size**
- Larger than session IDs
- Increases request size
- Bandwidth overhead

❌ **Revocation Difficulty**
- Cannot revoke tokens immediately
- Must wait for expiration
- Need blacklist for revocation

❌ **Security Risks**
- If stolen, valid until expiration
- Must be stored securely on client
- Vulnerable to XSS if stored in localStorage

❌ **Payload Visibility**
- Payload is base64-encoded (not encrypted)
- Don't store sensitive data
- Anyone can decode payload

### Mitigation Strategies

| Risk | Mitigation |
|------|------------|
| Token theft | Use HTTPS, short expiration, HTTP-only cookies |
| XSS attacks | Store in HTTP-only cookies, not localStorage |
| Revocation | Implement token blacklist, use refresh tokens |
| Large payload | Store minimal data, use reference tokens |
| Sensitive data | Never store passwords, secrets in payload |

### Interview Answer
"JWT advantages: stateless (no session storage), cross-domain support, self-contained (all user info), standard (RFC 7519), and performant (no DB lookup). Limitations: larger size, difficult to revoke, security risks if stolen, and payload is visible (not encrypted). Mitigations: use HTTPS, short expiration, HTTP-only cookies, token blacklist, and avoid sensitive data in payload."

---

## 9. Common JWT Security Vulnerabilities

### 1. Weak Secret Key
**Problem**: Using weak or predictable secret keys
**Solution**: Use strong, random keys (at least 256 bits)
```java
// Bad
String secret = "secret";

// Good
String secret = generateRandom256BitKey();
```

### 2. None Algorithm
**Problem**: Attacker sets algorithm to "none" to bypass signature
**Solution**: Always validate algorithm
```java
// Always specify algorithm
Jwts.parserBuilder()
    .require("alg", "HS256")
    .setSigningKey(secret)
    .build();
```

### 3. Token Storage in localStorage
**Problem**: Vulnerable to XSS attacks
**Solution**: Store in HTTP-only cookies or secure storage
```javascript
// Bad
localStorage.setItem('token', jwtToken);

// Good
// Server sets HTTP-only cookie
Set-Cookie: token=jwtToken; HttpOnly; Secure; SameSite=Strict
```

### 4. No Expiration
**Problem**: Tokens valid forever
**Solution**: Always set expiration
```java
// Bad
String token = Jwts.builder()
    .signWith(secret)
    .compact();

// Good
String token = Jwts.builder()
    .setExpiration(new Date(System.currentTimeMillis() + 3600000))
    .signWith(secret)
    .compact();
```

### 5. Sensitive Data in Payload
**Problem**: Payload is base64-encoded (not encrypted)
**Solution**: Never store sensitive data
```java
// Bad
.put("password", "user123")
.put("creditCard", "1234-5678-9012-3456")

// Good
.put("sub", "john@example.com")
.put("role", "USER")
```

### 6. Long Expiration Time
**Problem**: If stolen, valid for long time
**Solution**: Use short expiration with refresh tokens
```java
// Bad - 1 year
.setExpiration(new Date(System.currentTimeMillis() + 365 * 24 * 60 * 60 * 1000))

// Good - 15 minutes
.setExpiration(new Date(System.currentTimeMillis() + 15 * 60 * 1000))
```

### Interview Answer
"Common JWT vulnerabilities: weak secret keys (use strong random keys), none algorithm attack (always validate algorithm), localStorage storage (use HTTP-only cookies), no expiration (always set expiration), sensitive data in payload (never store secrets), and long expiration (use short-lived tokens with refresh tokens)."

---

## 10. JwtService Implementation

### WHY we need it?
- Central place for JWT operations
- Generate tokens with consistent configuration
- Validate tokens with proper error handling
- Extract claims from tokens
- Encapsulate JWT library complexity

### WHAT is it?
Service class that handles JWT token generation, validation, and claim extraction.

### Implementation
```java
@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long jwtExpiration;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts
                .builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
```

### Method Explanations

#### extractUsername()
```java
public String extractUsername(String token) {
    return extractClaim(token, Claims::getSubject);
}
```
- Extracts the subject claim from token
- Subject contains user's email/username
- Used to identify the user

#### extractClaim()
```java
public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
    final Claims claims = extractAllClaims(token);
    return claimsResolver.apply(claims);
}
```
- Generic method to extract any claim
- Uses a function to extract specific claim
- Reusable for different claims

#### generateToken()
```java
public String generateToken(UserDetails userDetails) {
    return generateToken(new HashMap<>(), userDetails);
}
```
- Generates JWT token for a user
- Includes email as subject
- Includes expiration time
- Signs with secret key

#### isTokenValid()
```java
public boolean isTokenValid(String token, UserDetails userDetails) {
    final String username = extractUsername(token);
    return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
}
```
- Validates token for a specific user
- Checks if username matches
- Checks if token is not expired
- Used in JwtAuthenticationFilter

#### extractAllClaims()
```java
private Claims extractAllClaims(String token) {
    return Jwts
            .parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
}
```
- Parses token and extracts all claims
- Verifies signature using signing key
- Throws exception if signature invalid
- Throws exception if token expired

#### getSigningKey()
```java
private SecretKey getSigningKey() {
    byte[] keyBytes = Decoders.BASE64.decode(secret);
    return Keys.hmacShaKeyFor(keyBytes);
}
```
- Converts base64 secret to SecretKey
- Required for HMAC-SHA256 signing
- Key must be at least 256 bits

### Interview Answer
"JwtService handles JWT operations: generateToken() creates tokens with subject and expiration, extractUsername() gets the user from token, isTokenValid() validates token signature and expiration, extractAllClaims() parses token and verifies signature. We use the jjwt library for JWT operations. The secret key is base64-decoded and converted to a SecretKey for HMAC-SHA256 signing."

---

## 11. JwtAuthenticationFilter Implementation

### WHY we need it?
- Validate JWT on each request
- Extract token from Authorization header
- Load user details from token
- Set authentication in SecurityContextHolder
- Execute once per request

### WHAT is it?
Filter that extends OncePerRequestFilter to validate JWT tokens.

### Implementation
```java
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        
        try {
            userEmail = jwtService.extractUsername(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(userEmail);

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Token invalid or expired
        }

        filterChain.doFilter(request, response);
    }
}
```

### Line-by-Line Explanation

```java
public class JwtAuthenticationFilter extends OncePerRequestFilter
```
- Extends OncePerRequestFilter
- Guarantees execution once per request
- Prevents multiple executions in some scenarios

```java
final String authHeader = request.getHeader("Authorization");
```
- Extracts Authorization header from request
- Expected format: `Bearer <token>`

```java
if (authHeader == null || !authHeader.startsWith("Bearer ")) {
    filterChain.doFilter(request, response);
    return;
}
```
- Checks if header exists and starts with "Bearer "
- If not, continue to next filter (no authentication)
- Public endpoints don't require token

```java
jwt = authHeader.substring(7);
```
- Extracts token by removing "Bearer " prefix
- "Bearer " is 7 characters

```java
userEmail = jwtService.extractUsername(jwt);
```
- Extracts username (email) from token
- Uses the subject claim

```java
if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null)
```
- Checks if username extracted
- Checks if no authentication already in context
- Prevents re-authentication

```java
UserDetails userDetails = customUserDetailsService.loadUserByUsername(userEmail);
```
- Loads user details from database
- Ensures user still exists
- Gets latest account status and roles

```java
if (jwtService.isTokenValid(jwt, userDetails))
```
- Validates token signature
- Validates token expiration
- Validates username matches

```java
UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
    userDetails,
    null,
    userDetails.getAuthorities()
);
```
- Creates Authentication object
- Principal: userDetails
- Credentials: null (no password needed)
- Authorities: user's roles

```java
authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
```
- Sets authentication details (IP, session ID)
- Useful for audit logs

```java
SecurityContextHolder.getContext().setAuthentication(authToken);
```
- Sets authentication in SecurityContextHolder
- Makes authentication available throughout request
- Used by @PreAuthorize, hasRole(), etc.

```java
filterChain.doFilter(request, response);
```
- Continues to next filter in chain
- Eventually reaches controller

### Interview Answer
"JwtAuthenticationFilter extends OncePerRequestFilter to validate JWT on each request. It extracts the token from the Authorization header (Bearer format), validates it using JwtService, loads user details from database, creates an Authentication object, and sets it in SecurityContextHolder. This makes the authenticated user available throughout the request for authorization checks."

---

## 12. Why OncePerRequestFilter?

### WHY do we need it?
- Guarantees single execution per request
- Prevents duplicate authentication
- Handles request dispatch scenarios
- Standard pattern for custom filters

### WHAT is it?
OncePerRequestFilter is a Spring Security filter base class that ensures the filter is executed exactly once per request.

### HOW it works
```
Request → Filter1 → Filter2 → Filter3 → Controller
         ↑_________|
         (dispatch)

Without OncePerRequestFilter:
- Filter2 executes twice (original + dispatch)

With OncePerRequestFilter:
- Filter2 executes once (tracked by request attribute)
```

### Real-Time Example
```java
// Without OncePerRequestFilter
public class MyFilter implements Filter {
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
        // Executes multiple times in some scenarios
    }
}

// With OncePerRequestFilter
public class MyFilter extends OncePerRequestFilter {
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) {
        // Executes exactly once per request
    }
}
```

### Interview Answer
"OncePerRequestFilter ensures the filter executes exactly once per request. In some scenarios (like request dispatch), filters can execute multiple times. OncePerRequestFilter tracks execution using a request attribute to prevent duplicates. This is important for JWT authentication to avoid loading user details multiple times."

---

## 13. Why UsernamePasswordAuthenticationToken?

### WHY do we need it?
- Standard Spring Security authentication object
- Represents authenticated user
- Contains principal, credentials, authorities
- Required by SecurityContextHolder

### WHAT is it?
UsernamePasswordAuthenticationToken is an Authentication implementation for username/password authentication.

### HOW it works
```java
// During authentication (with credentials)
Authentication auth = new UsernamePasswordAuthenticationToken(
    username,      // Principal
    password,      // Credentials
    authorities    // Authorities
);

// After authentication (authenticated)
Authentication auth = new UsernamePasswordAuthenticationToken(
    userDetails,   // Principal (user object)
    null,          // Credentials (null after auth)
    authorities    // Authorities
);
```

### Constructor Overloads
```java
// 1. Unauthenticated (for authentication request)
public UsernamePasswordAuthenticationToken(Object principal, Object credentials)

// 2. Authenticated (after successful authentication)
public UsernamePasswordAuthenticationToken(
    Object principal,
    Object credentials,
    Collection<? extends GrantedAuthority> authorities
)
```

### Real-Time Example
```java
// In JwtAuthenticationFilter
UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
    userDetails,              // Principal: User entity
    null,                     // Credentials: null (already authenticated)
    userDetails.getAuthorities() // Authorities: [ROLE_USER]
);

SecurityContextHolder.getContext().setAuthentication(authToken);
```

### Interview Answer
"UsernamePasswordAuthenticationToken is Spring Security's standard Authentication implementation. We use it to create an authenticated Authentication object with the user details (principal), null credentials (since already authenticated), and authorities (roles). This object is then set in SecurityContextHolder to make the authenticated user available throughout the request."

---

## 14. Why SecurityContextHolder.getContext().setAuthentication()?

### WHY do we need it?
- Makes authentication available throughout request
- Used by authorization checks (@PreAuthorize, hasRole())
- Standard Spring Security pattern
- Thread-local storage for request scope

### WHAT is it?
SecurityContextHolder is the central place where Spring Security stores the SecurityContext, which holds the Authentication object.

### HOW it works
```java
// Set authentication
SecurityContextHolder.getContext().setAuthentication(authentication);

// Get authentication (anywhere in the application)
Authentication auth = SecurityContextHolder.getContext().getAuthentication();

// Get current user
User user = (User) auth.getPrincipal();
String email = user.getUsername();
Collection<GrantedAuthority> authorities = auth.getAuthorities();
```

### Real-Time Example
```java
// In JwtAuthenticationFilter
SecurityContextHolder.getContext().setAuthentication(authToken);

// In any controller
@GetMapping("/profile")
public ResponseEntity<UserProfile> getProfile() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    User user = (User) auth.getPrincipal();
    return ResponseEntity.ok(user.getProfile());
}

// In @PreAuthorize
@PreAuthorize("hasRole('ADMIN')")
public void deleteUser(Long id) {
    // Spring Security checks SecurityContextHolder for role
}
```

### Thread-Local Storage
```java
// Default strategy: ThreadLocalSecurityContextHolderStrategy
// Each thread has its own SecurityContext
// Automatically cleared at end of request
```

### Interview Answer
"SecurityContextHolder.getContext().setAuthentication() stores the Authentication object in the thread-local SecurityContext. This makes the authenticated user available throughout the request. Spring Security uses this for authorization checks like @PreAuthorize and hasRole(). We can access the current user anywhere using SecurityContextHolder.getContext().getAuthentication()."

---

## 15. Why SessionCreationPolicy.STATELESS?

### WHY do we need it?
- JWT is stateless by design
- No HTTP session should be created
- Each request authenticated independently
- Reduces server memory usage

### WHAT is it?
SessionCreationPolicy.STATELESS tells Spring Security not to create or use HTTP sessions.

### HOW it works
```java
.sessionManagement(session -> session
    .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
)
```

### SessionCreationPolicy Options

| Policy | Description | Use Case |
|--------|-------------|----------|
| ALWAYS | Always create session | Traditional web apps |
| NEVER | Never create, use if exists | REST APIs with optional auth |
| STATELESS | Never create or use | JWT-based REST APIs |
| IF_REQUIRED | Create only if needed | Default behavior |

### Real-Time Example
```java
// Stateful (session-based)
.sessionCreationPolicy(SessionCreationPolicy.ALWAYS)
// Session created on first request
// Session ID stored in cookie
// Subsequent requests use session ID

// Stateless (JWT)
.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
// No session created
// Each request authenticated independently
// JWT token sent in Authorization header
```

### Interview Answer
"SessionCreationPolicy.STATELESS tells Spring Security not to create or use HTTP sessions. Since JWT is stateless, we don't need sessions. Each request is authenticated independently using the JWT token. This reduces server memory usage and makes the application more scalable."

---

## 16. Why addFilterBefore()?

### WHY do we need it?
- Add JWT filter to the filter chain
- Execute before UsernamePasswordAuthenticationFilter
- Validate JWT before attempting username/password auth
- Proper order in filter chain

### WHAT is it?
addFilterBefore() adds a custom filter before an existing filter in the chain.

### HOW it works
```java
.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
```

### Filter Chain Order
```
Request → JwtAuthenticationFilter → UsernamePasswordAuthenticationFilter → ... → Controller
```

### WHY before UsernamePasswordAuthenticationFilter?
- We want to validate JWT first
- If JWT is valid, user is authenticated
- If JWT is invalid/missing, request continues
- UsernamePasswordAuthenticationFilter is only for login endpoint
- Login endpoint is public (permitAll), so it won't interfere

### Real-Time Example
```java
// Request with JWT
GET /api/products
Authorization: Bearer <token>

Flow:
1. JwtAuthenticationFilter validates token
2. Sets authentication in SecurityContextHolder
3. UsernamePasswordAuthenticationFilter skips (already authenticated)
4. Request reaches controller
5. Controller returns products

// Request without JWT (public endpoint)
POST /api/auth/login
{email, password}

Flow:
1. JwtAuthenticationFilter: no token, continues
2. UsernamePasswordAuthenticationFilter processes login
3. AuthenticationManager validates credentials
4. Returns JWT token
```

### Interview Answer
"addFilterBefore() adds our JwtAuthenticationFilter before UsernamePasswordAuthenticationFilter in the filter chain. This ensures JWT is validated before attempting username/password authentication. If JWT is valid, user is authenticated. If invalid or missing, request continues. This order is important because we want JWT validation to happen first."

---

## 17. Complete JWT Authentication Flow

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
  ↓ Queries UserRepository
UserRepository
  ↓ Returns User from database
CustomUserDetailsService
  ↓ Returns User (UserDetails)
DaoAuthenticationProvider
  ↓ Validates password with PasswordEncoder
  ↓ Returns Authentication (if valid)
AuthService
  ↓ Extracts User from Authentication
  ↓ Calls jwtService.generateToken(user)
JwtService
  ↓ Creates JWT with subject=email, expiration=24h
  ↓ Signs with secret key
  ↓ Returns token string
AuthService
  ↓ Returns AuthResponse with token
Response
  ↓ {token, email, role, message}
```

### Subsequent API Request Flow
```
Client
  ↓ GET /api/products
  ↓ Authorization: Bearer <token>
JwtAuthenticationFilter
  ↓ Extracts token from header
  ↓ Calls jwtService.extractUsername(token)
JwtService
  ↓ Parses token, validates signature
  ↓ Returns email
JwtAuthenticationFilter
  ↓ Calls customUserDetailsService.loadUserByUsername(email)
CustomUserDetailsService
  ↓ Loads User from database
  ↓ Returns User (UserDetails)
JwtAuthenticationFilter
  ↓ Calls jwtService.isTokenValid(token, userDetails)
JwtService
  ↓ Validates signature
  ↓ Validates expiration
  ↓ Validates username matches
  ↓ Returns true
JwtAuthenticationFilter
  ↓ Creates UsernamePasswordAuthenticationToken
  ↓ Sets authorities from userDetails
  ↓ Calls SecurityContextHolder.getContext().setAuthentication()
SecurityContextHolder
  ↓ Stores Authentication in thread-local
JwtAuthenticationFilter
  ↓ Continues to next filter
Filter Chain
  ↓ Continues through filters
SecurityFilterChain
  ↓ Checks authorization (hasRole)
  ↓ If authorized → Controller
  ↓ If not authorized → 403 Forbidden
Controller
  ↓ Accesses authenticated user via @AuthenticationPrincipal
  ↓ Returns response
```

### Error Scenarios

| Scenario | Error | HTTP Status |
|----------|-------|-------------|
| Token missing | No authentication | 401 Unauthorized |
| Token invalid | Signature validation fails | 401 Unauthorized |
| Token expired | Expiration check fails | 401 Unauthorized |
| User not found | UsernameNotFoundException | 401 Unauthorized |
| User disabled | DisabledException | 401 Unauthorized |
| Insufficient permissions | AccessDeniedException | 403 Forbidden |

### Interview Answer
"During login, credentials are validated by AuthenticationManager, and if valid, a JWT token is generated with the user's email as subject and 24-hour expiration. For subsequent requests, JwtAuthenticationFilter extracts the token from the Authorization header, validates it using JwtService, loads user details from database, creates an Authentication object, and sets it in SecurityContextHolder. The request then proceeds through authorization checks before reaching the controller."

---

## 18. Environment Variables for JWT Secret

### WHY use environment variables?
- Never hardcode secrets in source code
- Different secrets for different environments
- Easy to rotate secrets
- Prevents secrets from being committed to git

### HOW to configure
```properties
# application.properties
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION:86400000}
```

```bash
# Environment variables
export JWT_SECRET=your-base64-encoded-secret-key
export JWT_EXPIRATION=86400000
```

```yaml
# docker-compose.yml
environment:
  - JWT_SECRET=your-base64-encoded-secret-key
  - JWT_EXPIRATION=86400000
```

### Real-Time Example
```properties
# Development
jwt.secret=${JWT_SECRET:YW5vdGhlcnNlY3JldGtleXRoYXRpc2F0bGVhc3QyNTZiaXRzbG9uZ2ZvcmhzMjU2YWxnb3JpdGht}

# Production (from environment)
jwt.secret=${JWT_SECRET}
```

### Interview Answer
"We should never hardcode JWT secrets in source code. Instead, we use environment variables. In application.properties, we use ${JWT_SECRET} to read from environment. This allows different secrets for different environments, easy secret rotation, and prevents secrets from being committed to git. In production, the secret is set via environment variables or Kubernetes secrets."

---

## Summary

### Key Components Implemented
1. **JwtService** - Generate and validate JWT tokens
2. **JwtAuthenticationFilter** - Validate JWT on each request
3. **SecurityConfig** - Add JWT filter to filter chain
4. **AuthService** - Generate JWT after successful authentication
5. **application.properties** - JWT configuration

### JWT Token Structure
```
Header.Payload.Signature
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Key Concepts
- JWT is stateless and self-contained
- Token contains header, payload, signature
- Signature ensures integrity and authenticity
- Expiration limits token lifetime
- Bearer token format in Authorization header
- OncePerRequestFilter executes once per request
- SecurityContextHolder stores authentication
- SessionCreationPolicy.STATELESS for JWT

### Next Steps
With JWT authentication complete, we'll implement:
1. Complete JWT Authentication Flow documentation (Phase 6)
2. Role-Based Authorization (Phase 7)
3. Microservices Security (Phase 8)
