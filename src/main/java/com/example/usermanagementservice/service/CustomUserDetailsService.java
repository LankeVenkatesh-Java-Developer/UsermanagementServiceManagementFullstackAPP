package com.example.usermanagementservice.service;

import com.example.usermanagementservice.entity.User;
import com.example.usermanagementservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * CustomUserDetailsService - Loads user-specific data
 * 
 * WHY we need it:
 * - Spring Security needs to load user details from our database
 * - Implements UserDetailsService interface for authentication
 * - Provides user data to AuthenticationProvider
 * 
 * HOW it works internally:
 * 1. AuthenticationProvider calls loadUserByUsername()
 * 2. We query database to find user by email
 * 3. Return UserDetails object with user's authorities
 * 4. AuthenticationProvider validates password using PasswordEncoder
 * 
 * Real-Time Example:
 * When user logs in with email "john@example.com":
 * - Spring Security calls loadUserByUsername("john@example.com")
 * - We query UserRepository to find user
 * - Return User object (which implements UserDetails)
 * - Spring Security validates password
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Load user from database by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
        // Return User object (which implements UserDetails)
        // Spring Security will use this for authentication
        return user;
    }
}
