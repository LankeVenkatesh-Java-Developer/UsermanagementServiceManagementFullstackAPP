package com.example.usermanagementservice.filter;

import com.example.usermanagementservice.service.CustomUserDetailsService;
import com.example.usermanagementservice.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JwtAuthenticationFilter - Validates JWT token on each request
 * 
 * WHY we need it:
 * - Extract JWT token from Authorization header
 * - Validate token signature and expiration
 * - Load user details from token
 * - Set authenticated user in SecurityContextHolder
 * - Execute once per request (not multiple times)
 * 
 * WHAT is OncePerRequestFilter:
 * A Spring Security filter that guarantees to be executed just once per request.
 * This is important because the filter chain may be executed multiple times in some cases.
 * 
 * HOW it works:
 * 1. Request comes in with Authorization: Bearer <token>
 * 2. Filter extracts token from header
 * 3. Validates token using JwtService
 * 4. Extracts username from token
 * 5. Loads user details from database
 * 6. Creates Authentication object
 * 7. Sets Authentication in SecurityContextHolder
 * 8. Request continues to controller
 */
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
        
        // Extract Authorization header
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // Check if header exists and starts with "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // No token provided, continue to next filter
            filterChain.doFilter(request, response);
            return;
        }

        // Extract token from "Bearer <token>"
        jwt = authHeader.substring(7); // Remove "Bearer " prefix
        
        try {
            // Extract username (email) from token
            userEmail = jwtService.extractUsername(jwt);

            // If username extracted and no authentication in SecurityContext
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Load user details from database
                /* 
                 * WHY load from database?
                 * - Ensures user still exists
                 * - Gets latest account status (enabled, locked, etc.)
                 * - Gets latest roles/authorities
                 * - Allows real-time account management
                 */
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(userEmail);

                // Validate token
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    // Create Authentication object
                    /*
                     * UsernamePasswordAuthenticationToken:
                     * - principal: userDetails (user object)
                     * - credentials: null (no password needed for authenticated user)
                     * - authorities: user's roles/permissions
                     */
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

                    // Set authentication details (IP address, session ID, etc.)
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    // Set authentication in SecurityContextHolder
                    /*
                     * WHY set in SecurityContextHolder?
                     * - Makes authentication available throughout the request
                     * - Used by @PreAuthorize, hasRole(), etc.
                     * - Available in any service/controller via SecurityContextHolder
                     */
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Token is invalid or expired
            // Don't throw exception, just continue without authentication
            // The endpoint will return 401 if authentication is required
        }

        // Continue to next filter in the chain
        filterChain.doFilter(request, response);
    }
}
