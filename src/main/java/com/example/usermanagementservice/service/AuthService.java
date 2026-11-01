package com.example.usermanagementservice.service;

import com.example.usermanagementservice.dto.AuthResponse;
import com.example.usermanagementservice.dto.LoginRequest;
import com.example.usermanagementservice.dto.RegisterRequest;
import com.example.usermanagementservice.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

/**
 * AuthService - Handles authentication operations
 * 
 * WHY we need it:
 * - Central place for authentication logic
 * - Separates auth logic from controller
 * - Uses AuthenticationManager for credential validation
 * - Generates JWT tokens after successful authentication
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    /**
     * Register a new user
     * - Validates email uniqueness
     * - Encodes password with BCrypt
     * - Saves user to database
     */
    public User registerUser(RegisterRequest request) {
        return userService.registerUser(request);
    }

    /**
     * Authenticate user credentials and generate JWT token
     * - Uses AuthenticationManager to validate credentials
     * - Delegates to DaoAuthenticationProvider
     * - DaoAuthenticationProvider calls CustomUserDetailsService
     * - CustomUserDetailsService loads user from database
     * - PasswordEncoder validates password
     * - If valid, generates JWT token
     * 
     * Flow:
     * 1. Create UsernamePasswordAuthenticationToken with credentials
     * 2. Call authenticationManager.authenticate()
     * 3. AuthenticationManager delegates to DaoAuthenticationProvider
     * 4. DaoAuthenticationProvider calls CustomUserDetailsService.loadUserByUsername()
     * 5. User loaded from database
     * 6. PasswordEncoder.matches() validates password
     * 7. If valid, returns authenticated Authentication object
     * 8. If invalid, throws BadCredentialsException
     * 9. If valid, generate JWT token using JwtService
     * 10. Return token to client
     */
    public AuthResponse authenticateUser(LoginRequest request) {
        try {
            // Create authentication token with credentials
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getPassword()
            );

            // Authenticate using AuthenticationManager
            Authentication authenticated = authenticationManager.authenticate(authentication);

            // If successful, get the authenticated user
            User user = (User) authenticated.getPrincipal();

            // Generate JWT token
            String jwtToken = jwtService.generateToken(user);

            // Return response with JWT token
            AuthResponse response = new AuthResponse();
            response.setToken(jwtToken);
            response.setEmail(user.getEmail());
            response.setRole(user.getRole().name());
            response.setMessage("Login successful");
            
            return response;

        } catch (AuthenticationException e) {
            throw new RuntimeException("Invalid email or password");
        }
    }
}
