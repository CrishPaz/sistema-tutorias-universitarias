package com.tutorias.application.service;

import com.tutorias.domain.Usuario;
import com.tutorias.exceptions.ConflictException;
import com.tutorias.exceptions.NotFoundException;
import com.tutorias.interfaces.dto.AuthResponse;
import com.tutorias.interfaces.dto.LoginRequest;
import com.tutorias.interfaces.dto.RegisterRequest;
import com.tutorias.repository.UsuarioRepository;
import com.tutorias.security.CustomUserDetailsService;
import com.tutorias.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Servicio de Autenticación (Clean Architecture - Application Layer)
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService; // Inyectado para consistencia

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validar si el email ya existe
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("El email ya está registrado");
        }

        // Crear usuario
        Usuario usuario = Usuario.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .nombreCompleto(request.getNombreCompleto())
                .telefono(request.getTelefono())
                .rol(request.getRol() != null ? request.getRol() : Usuario.Rol.ESTUDIANTE)
                .estado(Usuario.EstadoUsuario.ACTIVO)
                .emailVerificado(false)
                .build();

        Usuario savedUser = usuarioRepository.save(usuario);

        // Generar tokens
        UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getEmail());
        String accessToken = jwtUtil.generateAccessToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getAccessTokenExpiration())
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .nombreCompleto(savedUser.getNombreCompleto())
                .rol(savedUser.getRol().name())
                .message("Registro exitoso. ¡Bienvenido!")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String accessToken = jwtUtil.generateAccessToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        // Actualizar último login
        usuario.setUltimoLogin(LocalDateTime.now());
        usuarioRepository.save(usuario);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getAccessTokenExpiration())
                .userId(usuario.getId())
                .email(usuario.getEmail())
                .nombreCompleto(usuario.getNombreCompleto())
                .rol(usuario.getRol().name())
                .message("Inicio de sesión exitoso")
                .build();
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtUtil.isRefreshToken(refreshToken)) {
            throw new RuntimeException("Token de refresco inválido");
        }

        String email = jwtUtil.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

        if (!jwtUtil.validateToken(refreshToken, userDetails)) {
            throw new RuntimeException("Token de refresco expirado o inválido");
        }

        String newAccessToken = jwtUtil.generateAccessToken(userDetails);
        String newRefreshToken = jwtUtil.generateRefreshToken(userDetails);

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getAccessTokenExpiration())
                .userId(usuario.getId())
                .email(usuario.getEmail())
                .nombreCompleto(usuario.getNombreCompleto())
                .rol(usuario.getRol().name())
                .message("Token refrescado exitosamente")
                .build();
    }

    public void logout(String token) {
        // En producción: agregar token a blacklist en Redis
        // Por ahora solo invalidamos el contexto
        SecurityContextHolder.clearContext();
    }
}