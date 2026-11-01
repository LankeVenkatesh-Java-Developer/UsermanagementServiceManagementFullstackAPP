# Role-Based Authorization - Phase 7

## Overview

In Phase 7, we implement role-based authorization to control what authenticated users can do. We use both URL-level security and method-level security annotations to enforce access control.

---

## 1. Authentication vs Authorization

### Comparison Table

| Aspect | Authentication | Authorization |
|--------|----------------|---------------|
| Question | Who are you? | What can you do? |
| Purpose | Verify identity | Verify permissions |
| First step | Yes | No (requires authentication first) |
| Spring Security | AuthenticationManager | AccessDecisionManager |
| Example | Login with email/password | Check if user has ADMIN role |
| Failure | 401 Unauthorized | 403 Forbidden |
| Storage | SecurityContextHolder | GrantedAuthority in Authentication |

### Real-Time Example

**Authentication:**
```
User submits: john@example.com / password123
→ System verifies credentials
→ If valid, user is authenticated
→ Now system knows WHO the user is
```

**Authorization:**
```
Authenticated user tries to access /api/admin/users
→ System checks user's roles
→ User has ROLE_USER
→ Endpoint requires ROLE_ADMIN
→ Access denied (403 Forbidden)
```

### Interview Answer
"Authentication verifies who you are (login with credentials), while authorization determines what you can do (check roles/permissions). Authentication is the first step - you must be authenticated before authorization can happen. For example, logging in with email and password is authentication, and checking if you can access admin pages is authorization. Authentication failure returns 401, authorization failure returns 403."

---

## 2. Role vs Authority

### Comparison Table

| Aspect | Role | Authority |
|--------|------|-----------|
| Purpose | High-level grouping of permissions | Specific permission |
| Naming | Convention: ROLE_XXX | Any string |
| Granularity | Coarse-grained | Fine-grained |
| Example | ROLE_ADMIN, ROLE_USER | READ_PRODUCT, DELETE_ORDER |
| Usage | hasRole("ADMIN") | hasAuthority("READ_PRODUCT") |
| Relationship | Role = Collection of authorities | Authority = Single permission |
| Prefix | Automatic "ROLE_" prefix | No prefix |

### Real-Time Example

**Role-based:**
```java
@PreAuthorize("hasRole('ADMIN')")
public void deleteUser(Long id) {
    // Only users with ROLE_ADMIN can call this
}
```

**Authority-based:**
```java
@PreAuthorize("hasAuthority('DELETE_USER')")
public void deleteUser(Long id) {
    // Only users with DELETE_USER authority can call this
}
```

**Combined approach:**
```java
// Role contains multiple authorities
ROLE_ADMIN → [READ_USER, WRITE_USER, DELETE_USER, READ_PRODUCT, WRITE_PRODUCT, DELETE_PRODUCT]
ROLE_USER → [READ_PRODUCT, CREATE_ORDER, VIEW_OWN_ORDERS]
```

### Implementation in User Entity
```java
@Override
public Collection<? extends GrantedAuthority> getAuthorities() {
    return Set.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
}
```

**WHAT happens:**
- User entity has Role enum (USER, ADMIN)
- getAuthorities() converts role to GrantedAuthority
- Prefixes with "ROLE_" for hasRole() to work
- Returns: [ROLE_USER] or [ROLE_ADMIN]

### Interview Answer
"Roles are high-level groupings of permissions, typically prefixed with 'ROLE_', like ROLE_ADMIN or ROLE_USER. Authorities are fine-grained permissions like READ_PRODUCT or DELETE_USER. A role typically contains multiple authorities. In Spring Security, hasRole() automatically adds 'ROLE_' prefix, while hasAuthority() checks the exact string. We use roles for coarse-grained access control and authorities for fine-grained permissions."

---

## 3. hasRole() vs hasAuthority()

### Comparison Table

| Method | Prefix | Example | Equivalent |
|--------|--------|---------|------------|
| hasRole("ADMIN") | Adds "ROLE_" | hasRole("ADMIN") | hasAuthority("ROLE_ADMIN") |
| hasAuthority("ADMIN") | No prefix | hasAuthority("ADMIN") | Checks exact "ADMIN" |
| hasAnyRole("USER", "ADMIN") | Adds "ROLE_" | hasAnyRole("USER", "ADMIN") | hasAnyAuthority("ROLE_USER", "ROLE_ADMIN") |
| hasAnyAuthority("READ", "WRITE") | No prefix | hasAnyAuthority("READ", "WRITE") | Checks exact strings |

### Real-Time Example

**Using hasRole():**
```java
@PreAuthorize("hasRole('ADMIN')")
public void deleteUser(Long id) {
    // Requires: ROLE_ADMIN authority
}
```

**Using hasAuthority():**
```java
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public void deleteUser(Long id) {
    // Requires: ROLE_ADMIN authority (same as above)
}
```

**Using hasAnyRole():**
```java
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public List<Product> getProducts() {
    // Requires: ROLE_USER OR ROLE_ADMIN
}
```

**Using hasAnyAuthority():**
```java
@PreAuthorize("hasAnyAuthority('READ_PRODUCT', 'WRITE_PRODUCT')")
public List<Product> getProducts() {
    // Requires: READ_PRODUCT OR WRITE_PRODUCT authority
}
```

### When to Use Which

| Scenario | Recommended Method |
|----------|-------------------|
| Role-based access (coarse-grained) | hasRole() |
| Permission-based access (fine-grained) | hasAuthority() |
| Multiple roles allowed | hasAnyRole() |
| Multiple permissions allowed | hasAnyAuthority() |

### Interview Answer
"hasRole() automatically adds 'ROLE_' prefix, so hasRole('ADMIN') checks for 'ROLE_ADMIN'. hasAuthority() checks the exact string without prefix. hasAnyRole() and hasAnyAuthority() check for multiple roles/authorities. Use hasRole() for coarse-grained role-based access and hasAuthority() for fine-grained permission-based access."

---

## 4. URL-Level Security vs Method-Level Security

### Comparison Table

| Aspect | URL-Level Security | Method-Level Security |
|--------|-------------------|----------------------|
| Configuration | SecurityConfig | @PreAuthorize, @PostAuthorize |
| Scope | Entire endpoint | Individual method |
| Granularity | Coarse | Fine |
| Flexibility | Limited | High |
| Example | .requestMatchers("/api/admin/**").hasRole("ADMIN") | @PreAuthorize("hasRole('ADMIN')") |
| Use Case | Simple role-based URL protection | Complex business logic authorization |

### URL-Level Security

**Configuration in SecurityConfig:**
```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/register").permitAll()
    .requestMatchers("/api/auth/login").permitAll()
    .requestMatchers("/api/products/**").hasAnyRole("USER", "ADMIN")
    .requestMatchers("/api/orders/**").hasAnyRole("USER", "ADMIN")
    .requestMatchers("/api/admin/**").hasRole("ADMIN")
    .anyRequest().authenticated()
)
```

**Advantages:**
- Centralized configuration
- Easy to understand
- Good for simple role-based access
- Applied to entire endpoint

**Disadvantages:**
- Limited flexibility
- Can't access method parameters
- Can't implement complex logic
- All-or-nothing for endpoint

### Method-Level Security

**Annotations on methods:**
```java
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @GetMapping
    public List<Product> getAllProducts() {
        // No annotation - uses URL-level security
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Product createProduct(@RequestBody ProductRequest request) {
        // Only ADMIN can create products
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Product updateProduct(@PathVariable Long id, @RequestBody ProductRequest request) {
        // Only ADMIN can update products
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteProduct(@PathVariable Long id) {
        // Only ADMIN can delete products
    }
}
```

**Advantages:**
- Fine-grained control
- Can access method parameters
- Can implement complex logic
- Different rules for different methods

**Disadvantages:**
- Scattered across codebase
- Requires @EnableMethodSecurity
- More complex to understand

### Real-Time Example

**URL-Level:**
```
/api/admin/users → hasRole("ADMIN")
/api/admin/orders → hasRole("ADMIN")
/api/admin/products → hasRole("ADMIN")
All admin endpoints require ADMIN role
```

**Method-Level:**
```java
@GetMapping("/api/orders/{id}")
@PreAuthorize("#userId == authentication.principal.id or hasRole('ADMIN')")
public Order getOrder(@PathVariable Long id, @RequestParam Long userId) {
    // User can view own order OR ADMIN can view any order
}
```

### Combined Approach

**Best practice: Use both**
- URL-level: Basic role-based access
- Method-level: Complex business logic authorization

```java
// SecurityConfig - URL-level
.requestMatchers("/api/orders/**").hasAnyRole("USER", "ADMIN")

// Controller - Method-level
@GetMapping("/api/orders/my-orders")
@PreAuthorize("hasRole('USER')")
public List<Order> getMyOrders() {
    // USER can view own orders
}

@GetMapping("/api/orders/{id}")
@PreAuthorize("hasRole('ADMIN')")
public Order getOrder(@PathVariable Long id) {
    // ADMIN can view any order
}
```

### Interview Answer
"URL-level security is configured in SecurityConfig using requestMatchers() and applies to entire endpoints. Method-level security uses annotations like @PreAuthorize on individual methods and provides fine-grained control. URL-level is good for simple role-based access, while method-level is better for complex authorization logic. Best practice is to use both: URL-level for basic access control and method-level for complex business rules."

---

## 5. @PreAuthorize

### WHY use it?
- Check authorization before method execution
- Access method parameters in authorization expression
- Implement complex authorization logic
- Fine-grained control at method level

### WHAT is it?
@PreAuthorize is a Spring Security annotation that checks authorization before a method is executed.

### HOW it works
```java
@PreAuthorize("hasRole('ADMIN')")
public void deleteUser(Long id) {
    // Before execution, Spring Security checks:
    // 1. User is authenticated
    // 2. User has ROLE_ADMIN
    // 3. If both true → execute method
    // 4. If either false → throw AccessDeniedException
}
```

### Common Expressions

| Expression | Meaning |
|------------|---------|
| `hasRole('ADMIN')` | User has ROLE_ADMIN |
| `hasAuthority('DELETE_USER')` | User has DELETE_USER authority |
| `hasAnyRole('USER', 'ADMIN')` | User has ROLE_USER OR ROLE_ADMIN |
| `hasAnyAuthority('READ', 'WRITE')` | User has READ OR WRITE authority |
| `isAuthenticated()` | User is authenticated |
| `isAnonymous()` | User is anonymous |
| `permitAll()` | Allow everyone |
| `denyAll()` | Deny everyone |
| `#userId == authentication.principal.id` | Parameter matches authenticated user ID |
| `#order.owner == authentication.principal` | Order belongs to authenticated user |

### Real-Time Examples

**Simple role check:**
```java
@PreAuthorize("hasRole('ADMIN')")
public void deleteUser(Long id) {
    userRepository.deleteById(id);
}
```

**Multiple roles:**
```java
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public List<Product> getProducts() {
    return productRepository.findAll();
}
```

**Parameter-based authorization:**
```java
@PreAuthorize("#userId == authentication.principal.id")
public UserProfile getProfile(@PathVariable Long userId) {
    return userService.getProfile(userId);
}
```

**Complex logic:**
```java
@PreAuthorize("#userId == authentication.principal.id or hasRole('ADMIN')")
public Order getOrder(@PathVariable Long userId, @PathVariable Long orderId) {
    return orderService.getOrder(orderId);
}
```

**Authority-based:**
```java
@PreAuthorize("hasAuthority('DELETE_USER')")
public void deleteUser(Long id) {
    userRepository.deleteById(id);
}
```

### Interview Answer
"@PreAuthorize checks authorization before method execution. It supports expressions like hasRole('ADMIN'), hasAnyRole('USER', 'ADMIN'), and parameter-based checks like #userId == authentication.principal.id. It provides fine-grained control and can access method parameters for complex authorization logic. If the check fails, AccessDeniedException is thrown and 403 Forbidden is returned."

---

## 6. @PostAuthorize

### WHY use it?
- Check authorization after method execution
- Access method return value in authorization expression
- Implement authorization based on returned data
- Useful for filtering results based on permissions

### WHAT is it?
@PostAuthorize is a Spring Security annotation that checks authorization after a method is executed.

### HOW it works
```java
@PostAuthorize("returnObject.owner == authentication.principal")
public Order getOrder(Long orderId) {
    // Method executes first
    // Return value is checked against expression
    // If check passes → return value
    // If check fails → throw AccessDeniedException
}
```

### Real-Time Examples

**Check return value:**
```java
@PostAuthorize("returnObject.owner == authentication.principal")
public Order getOrder(Long orderId) {
    return orderRepository.findById(orderId);
}
```

**Filter results:**
```java
@PostAuthorize("filterObject.owner == authentication.principal")
public List<Order> getOrders() {
    return orderRepository.findAll();
}
```

### WHEN to use @PostAuthorize vs @PreAuthorize

| Scenario | Recommended |
|----------|-------------|
| Check before execution (performance) | @PreAuthorize |
| Check based on return value | @PostAuthorize |
| Check based on method parameters | @PreAuthorize |
| Filter results based on permissions | @PostAuthorize |

### Interview Answer
"@PostAuthorize checks authorization after method execution, allowing access to the return value. It's useful when authorization depends on the returned data, like checking if the returned order belongs to the authenticated user. @PreAuthorize is preferred for performance when possible, but @PostAuthorize is needed when the check requires the return value."

---

## 7. @Secured

### WHY use it?
- Simple role-based authorization
- Legacy annotation (still supported)
- Less powerful than @PreAuthorize
- Good for simple use cases

### WHAT is it?
@Secured is a Spring Security annotation for simple role-based authorization.

### HOW it works
```java
@Secured("ROLE_ADMIN")
public void deleteUser(Long id) {
    userRepository.deleteById(id);
}
```

### Real-Time Example
```java
@Secured({"ROLE_USER", "ROLE_ADMIN"})
public List<Product> getProducts() {
    return productRepository.findAll();
}
```

### @Secured vs @PreAuthorize

| Aspect | @Secured | @PreAuthorize |
|--------|----------|---------------|
| Power | Limited | Powerful |
| Expressions | No | Yes |
| Parameters | No | Yes |
| Prefix | Required "ROLE_" | Automatic for hasRole() |
| Modern | Legacy | Modern |

### Interview Answer
"@Secured is a legacy annotation for simple role-based authorization. It requires the full role name including 'ROLE_' prefix. @PreAuthorize is the modern alternative with more powerful expressions and better support for complex authorization logic. We prefer @PreAuthorize over @Secured in new applications."

---

## 8. @EnableMethodSecurity

### WHY use we need it?
- Enable method-level security annotations
- Required for @PreAuthorize, @PostAuthorize, @Secured
- Not enabled by default in Spring Security 6.x
- Configures method security aspects

### WHAT is it?
@EnableMethodSecurity is an annotation that enables Spring Security's method-level security annotations.

### HOW it works
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    // Security configuration
}
```

### Configuration Options
```java
@EnableMethodSecurity(
    prePostEnabled = true,    // Enable @PreAuthorize and @PostAuthorize
    securedEnabled = true,   // Enable @Secured
    jsr250Enabled = true      // Enable JSR-250 annotations (@RolesAllowed)
)
```

### Real-Time Example
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    // Now @PreAuthorize works in controllers/services
}

@RestController
public class ProductController {
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteProduct(Long id) {
        // This annotation now works
    }
}
```

### Interview Answer
"@EnableMethodSecurity enables method-level security annotations like @PreAuthorize, @PostAuthorize, and @Secured. It's required in Spring Security 6.x because method-level security is not enabled by default. We add it to our SecurityConfig to use @PreAuthorize in our controllers and services."

---

## 9. Practical API Examples

### Example 1: Product Management

**URL-Level Security:**
```java
.requestMatchers("/api/products/**").hasAnyRole("USER", "ADMIN")
```

**Method-Level Security:**
```java
@RestController
@RequestMapping("/api/products")
public class ProductController {

    // All authenticated users can view products
    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    // Only ADMIN can create, update, delete products
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Product createProduct(@RequestBody ProductRequest request) {
        return productService.createProduct(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Product updateProduct(@PathVariable Long id, @RequestBody ProductRequest request) {
        return productService.updateProduct(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }
}
```

**Postman Tests:**
```bash
# USER can view products
GET /api/products
Authorization: Bearer <USER_TOKEN>
→ 200 OK

# USER cannot create products
POST /api/products
Authorization: Bearer <USER_TOKEN>
→ 403 Forbidden

# ADMIN can create products
POST /api/products
Authorization: Bearer <ADMIN_TOKEN>
→ 201 Created
```

### Example 2: Order Management

**URL-Level Security:**
```java
.requestMatchers("/api/orders/**").hasAnyRole("USER", "ADMIN")
```

**Method-Level Security:**
```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    // USER can create orders
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public Order createOrder(@RequestBody OrderRequest request, @AuthenticationPrincipal User user) {
        return orderService.createOrder(request, user);
    }

    // USER can view own orders
    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('USER')")
    public List<Order> getMyOrders(@AuthenticationPrincipal User user) {
        return orderService.getOrdersByUser(user);
    }

    // ADMIN can view all orders
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    // ADMIN can view any order
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Order getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }
}
```

**Postman Tests:**
```bash
# USER can create orders
POST /api/orders
Authorization: Bearer <USER_TOKEN>
→ 201 Created

# USER can view own orders
GET /api/orders/my-orders
Authorization: Bearer <USER_TOKEN>
→ 200 OK

# USER cannot view all orders
GET /api/orders
Authorization: Bearer <USER_TOKEN>
→ 403 Forbidden

# ADMIN can view all orders
GET /api/orders
Authorization: Bearer <ADMIN_TOKEN>
→ 200 OK
```

### Example 3: Admin Management

**URL-Level Security:**
```java
.requestMatchers("/api/admin/**").hasRole("ADMIN")
```

**Method-Level Security:**
```java
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.findAll();
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    @GetMapping("/orders")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }
}
```

**Postman Tests:**
```bash
# ADMIN can view all users
GET /api/admin/users
Authorization: Bearer <ADMIN_TOKEN>
→ 200 OK

# USER cannot access admin endpoints
GET /api/admin/users
Authorization: Bearer <USER_TOKEN>
→ 403 Forbidden
```

### Example 4: Parameter-Based Authorization

```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    // User can view own order or ADMIN can view any order
    @GetMapping("/{id}")
    @PreAuthorize("@orderService.isOwner(#id, authentication.principal) or hasRole('ADMIN')")
    public Order getOrder(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }
}

@Service
public class OrderService {
    public boolean isOwner(Long orderId, User user) {
        Order order = orderRepository.findById(orderId);
        return order.getUser().getId().equals(user.getId());
    }
}
```

### Interview Answer
"We implement role-based authorization using both URL-level and method-level security. URL-level in SecurityConfig defines basic access rules like /api/admin/** requires ADMIN role. Method-level with @PreAuthorize provides fine-grained control, like @PreAuthorize('hasRole('ADMIN')') on deleteProduct(). We use @AuthenticationPrincipal to inject the authenticated user. Postman tests verify that USER can view products but not create them, while ADMIN can perform all operations."

---

## 10. @AuthenticationPrincipal

### WHY use it?
- Inject authenticated user directly into method
- Avoid SecurityContextHolder.getContext().getAuthentication()
- Cleaner code
- Type-safe

### WHAT is it?
@AuthenticationPrincipal is a Spring Security annotation that injects the authenticated principal into a method parameter.

### HOW it works
```java
@GetMapping("/profile")
public ResponseEntity<UserProfile> getProfile(@AuthenticationPrincipal User user) {
    // User is automatically injected
    return ResponseEntity.ok(user.getProfile());
}
```

### Real-Time Example

**Without @AuthenticationPrincipal:**
```java
@GetMapping("/profile")
public ResponseEntity<UserProfile> getProfile() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    User user = (User) auth.getPrincipal();
    return ResponseEntity.ok(user.getProfile());
}
```

**With @AuthenticationPrincipal:**
```java
@GetMapping("/profile")
public ResponseEntity<UserProfile> getProfile(@AuthenticationPrincipal User user) {
    return ResponseEntity.ok(user.getProfile());
}
```

### Usage in Controllers
```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @PostMapping
    public Order createOrder(@RequestBody OrderRequest request, @AuthenticationPrincipal User user) {
        return orderService.createOrder(request, user);
    }

    @GetMapping("/my-orders")
    public List<Order> getMyOrders(@AuthenticationPrincipal User user) {
        return orderService.getOrdersByUser(user);
    }
}
```

### Interview Answer
"@AuthenticationPrincipal injects the authenticated user directly into method parameters, avoiding the need to manually extract from SecurityContextHolder. It provides cleaner, type-safe code. For example, @AuthenticationPrincipal User user injects the authenticated User entity, which we can use in our business logic."

---

## 11. Complete Authorization Flow

### Flow Diagram

```
┌─────────────┐
│   Client    │
│  (Browser/  │
│   Mobile)   │
└──────┬──────┘
       │
       │ GET /api/products
       │ Authorization: Bearer <token>
       ↓
┌──────────────────────────┐
│ JwtAuthenticationFilter  │
│  Validates JWT           │
└──────┬───────────────────┘
       │
       │ Sets authentication in SecurityContextHolder
       ↓
┌──────────────────────────┐
│   SecurityFilterChain    │
│  URL Authorization Check │
└──────┬───────────────────┘
       │
       │ .requestMatchers("/api/products/**").hasAnyRole("USER", "ADMIN")
       ↓
       │
       │ Gets authentication from SecurityContextHolder
       │ Checks if user has ROLE_USER or ROLE_ADMIN
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
       │ No @PreAuthorize annotation
       ↓
┌──────────────────────────┐
│   ProductService         │
│  getAllProducts()        │
└──────┬───────────────────┘
       │
       │ Returns products
       ↓
┌─────────────┐
│   Client    │
│  HTTP 200   │
│  [products] │
└─────────────┘
```

### Flow with @PreAuthorize

```
┌─────────────┐
│   Client    │
│  (Browser/  │
│   Mobile)   │
└──────┬──────┘
       │
       │ POST /api/products
       │ Authorization: Bearer <token>
       ↓
┌──────────────────────────┐
│ JwtAuthenticationFilter  │
│  Validates JWT           │
└──────┬───────────────────┘
       │
       │ Sets authentication in SecurityContextHolder
       ↓
┌──────────────────────────┐
│   SecurityFilterChain    │
│  URL Authorization Check │
└──────┬───────────────────┘
       │
       │ .requestMatchers("/api/products/**").hasAnyRole("USER", "ADMIN")
       ↓
       │
       │ Gets authentication from SecurityContextHolder
       │ Checks if user has ROLE_USER or ROLE_ADMIN
       ↓
       │
       │ Authorization granted
       ↓
┌──────────────────────────┐
│   ProductController      │
│  @PostMapping           │
│  @PreAuthorize          │
└──────┬───────────────────┘
       │
       │ @PreAuthorize("hasRole('ADMIN')")
       ↓
       │
       │ Method Security Interceptor checks
       │ Gets authentication from SecurityContextHolder
       │ Checks if user has ROLE_ADMIN
       ↓
       │
       │ User has ROLE_USER (not ADMIN)
       ↓
┌──────────────────────────┐
│   AccessDeniedHandler    │
│  Handles 403             │
└──────┬───────────────────┘
       │
       │ Returns HTTP 403 Forbidden
       ↓
┌─────────────┐
│   Client    │
│  HTTP 403   │
│  Access     │
│  Denied     │
└─────────────┘
```

### Interview Answer
"Authorization flow: After JWT authentication sets the user in SecurityContextHolder, SecurityFilterChain checks URL-level authorization rules. If granted, request reaches controller. If controller method has @PreAuthorize, method security interceptor checks the expression against the authentication. If check passes, method executes. If check fails, AccessDeniedException is thrown and 403 Forbidden is returned."

---

## 12. Common Authorization Patterns

### Pattern 1: Owner-Based Authorization
```java
@PreAuthorize("#userId == authentication.principal.id")
public UserProfile getProfile(@PathVariable Long userId) {
    return userService.getProfile(userId);
}
```

### Pattern 2: Owner or Admin
```java
@PreAuthorize("#userId == authentication.principal.id or hasRole('ADMIN')")
public Order getOrder(@PathVariable Long userId, @PathVariable Long orderId) {
    return orderService.getOrder(orderId);
}
```

### Pattern 3: Custom Method
```java
@PreAuthorize("@orderService.isOwner(#orderId, authentication.principal)")
public Order getOrder(@PathVariable Long orderId) {
    return orderService.getOrderById(orderId);
}

@Service
public class OrderService {
    public boolean isOwner(Long orderId, User user) {
        Order order = orderRepository.findById(orderId);
        return order.getUser().getId().equals(user.getId());
    }
}
```

### Pattern 4: Role-Based with Parameter
```java
@PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
public User getUser(@PathVariable Long userId) {
    return userService.findById(userId);
}
```

### Interview Answer
"Common authorization patterns include owner-based checks (#userId == authentication.principal.id), owner or admin (#userId == authentication.principal.id or hasRole('ADMIN')), custom method checks (@orderService.isOwner(#orderId, authentication.principal)), and role-based with parameters. These patterns provide flexible authorization based on business logic."

---

## Summary

### Key Concepts

1. **Authentication vs Authorization**
   - Authentication: Who are you? (401 if fails)
   - Authorization: What can you do? (403 if fails)

2. **Role vs Authority**
   - Role: High-level grouping (ROLE_ADMIN, ROLE_USER)
   - Authority: Fine-grained permission (READ_PRODUCT, DELETE_USER)

3. **hasRole() vs hasAuthority()**
   - hasRole(): Adds "ROLE_" prefix
   - hasAuthority(): Checks exact string

4. **URL-Level vs Method-Level Security**
   - URL-Level: SecurityConfig, entire endpoint
   - Method-Level: @PreAuthorize, individual method

5. **@PreAuthorize**
   - Checks before method execution
   - Supports complex expressions
   - Can access method parameters

6. **@EnableMethodSecurity**
   - Enables method-level annotations
   - Required in Spring Security 6.x
   - Configured in SecurityConfig

### Implementation Summary

**SecurityConfig (URL-Level):**
```java
.requestMatchers("/api/auth/**").permitAll()
.requestMatchers("/api/products/**").hasAnyRole("USER", "ADMIN")
.requestMatchers("/api/orders/**").hasAnyRole("USER", "ADMIN")
.requestMatchers("/api/admin/**").hasRole("ADMIN")
```

**ProductController (Method-Level):**
```java
@GetMapping // No annotation - uses URL-level
public List<Product> getAllProducts()

@PostMapping
@PreAuthorize("hasRole('ADMIN')")
public Product createProduct()

@PutMapping("/{id}")
@PreAuthorize("hasRole('ADMIN')")
public Product updateProduct()

@DeleteMapping("/{id}")
@PreAuthorize("hasRole('ADMIN')")
public void deleteProduct()
```

**AdminController (Method-Level):**
```java
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    // All methods require ADMIN role
}
```

### Next Steps

With role-based authorization complete, we'll implement:
1. Microservices Security with API Gateway (Phase 8)
2. Real-Time Project Implementation (Phase 9)
3. Testing (Phase 10)
4. Interview Preparation (Phase 11)
5. Complete Documentation (Phase 12)
