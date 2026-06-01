package com.tutorias.interfaces.dto;

import com.tutorias.domain.Usuario;

import java.time.LocalDateTime;
import java.util.UUID;

/** DTO de usuario para administración (sin passwordHash). */
public record UsuarioResponse(
        UUID id,
        String email,
        String nombreCompleto,
        String telefono,
        String rol,
        String estado,
        Boolean emailVerificado,
        LocalDateTime ultimoLogin,
        LocalDateTime createdAt
) {
    public static UsuarioResponse from(Usuario u) {
        return new UsuarioResponse(
                u.getId(),
                u.getEmail(),
                u.getNombreCompleto(),
                u.getTelefono(),
                u.getRol() != null ? u.getRol().name() : null,
                u.getEstado() != null ? u.getEstado().name() : null,
                u.getEmailVerificado(),
                u.getUltimoLogin(),
                u.getCreatedAt()
        );
    }
}
