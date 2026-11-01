package com.example.usermanagementservice.controller;

import com.example.usermanagementservice.dto.AuthResponse;
import com.example.usermanagementservice.dto.LoginRequest;
import com.example.usermanagementservice.dto.RegisterRequest;
import com.example.usermanagementservice.entity.User;
import com.example.usermanagementservice.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.registerUser(request);
        AuthResponse response = new AuthResponse();
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());
        response.setMessage("User registered successfully");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.authenticateUser(request);
        return ResponseEntity.ok(response);
    }
}
