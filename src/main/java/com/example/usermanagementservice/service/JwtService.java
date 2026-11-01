package com.example.usermanagementservice.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * JwtService - Handles JWT token generation and validation
 * 
 * WHY we need it:
 * - Generate JWT tokens after successful authentication
 * - Validate JWT tokens on each request
 * - Extract user information from tokens
 * - Check token expiration
 * 
 * WHAT is JWT:
 * JSON Web Token is a compact, URL-safe means of representing claims to be transferred between two parties.
 * It consists of three parts: Header, Payload, and Signature.
 * 
 * JWT Structure:
 * Header: {"alg": "HS256", "typ": "JWT"}
 * Payload: {"sub": "john@example.com", "role": "USER", "exp": 1234567890}
 * Signature: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
 * 
 * Final Token: header.payload.signature
 */
@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long jwtExpiration;

    /**
     * Extract username (email) from JWT token
     * Uses the subject claim which contains the user's email
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extract a specific claim from JWT token
     * Generic method to extract any claim using a function
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Generate JWT token for a user
     * Includes email as subject and expiration time
     */
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    /**
     * Generate JWT token with extra claims
     * Allows adding custom claims to the token
     */
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts
                .builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())  // Email as subject
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Validate JWT token
     * Checks:
     * 1. Token signature is valid
     * 2. Token is not expired
     * 3. Token subject matches the username
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    /**
     * Check if token is expired
     * Compares expiration date with current time
     */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Extract expiration date from token
     */
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extract all claims from token
     * Parses the token and returns all claims
     * This is where the signature is validated
     */
    private Claims extractAllClaims(String token) {
        return Jwts
                .parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Get the signing key for JWT
     * Converts the secret string to a SecretKey for HMAC-SHA256
     * The key must be at least 256 bits for HS256 algorithm
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
