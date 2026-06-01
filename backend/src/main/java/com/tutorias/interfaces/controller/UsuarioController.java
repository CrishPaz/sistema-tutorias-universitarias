package com.tutorias.interfaces.controller;

import com.tutorias.domain.Usuario;
import com.tutorias.exceptions.NotFoundException;
import com.tutorias.interfaces.dto.UsuarioResponse;
import com.tutorias.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Gestión de usuarios (administración). Protegido por /admin/** (ADMIN, COORDINADOR).
 */
@RestController
@RequestMapping("/admin/usuarios")
@RequiredArgsConstructor
@Tag(name = "Admin · Usuarios", description = "Listado y gestión de estado de usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    @GetMapping
    @Operation(summary = "Listar todos los usuarios")
    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll().stream()
                .map(UsuarioResponse::from)
                .collect(Collectors.toList());
    }

    @PatchMapping("/{id}/estado")
    @Transactional
    @Operation(summary = "Cambiar el estado de un usuario (ACTIVO/INACTIVO/SUSPENDIDO)")
    public UsuarioResponse cambiarEstado(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        String estado = body.getOrDefault("estado", "").toString().toUpperCase();
        try {
            usuario.setEstado(Usuario.EstadoUsuario.valueOf(estado));
        } catch (IllegalArgumentException e) {
            throw new com.tutorias.exceptions.ConflictException(
                    "Estado inválido. Use ACTIVO, INACTIVO o SUSPENDIDO");
        }
        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }
}
