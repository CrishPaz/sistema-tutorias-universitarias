package com.tutorias.interfaces.controller;

import com.tutorias.domain.Notificacion;
import com.tutorias.repository.NotificacionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Notificaciones por usuario.
 */
@RestController
@RequestMapping("/notificaciones")
@RequiredArgsConstructor
@Tag(name = "Notificaciones", description = "Avisos del sistema dirigidos a cada usuario")
public class NotificacionController {

    private final NotificacionRepository notificacionRepository;

    @GetMapping("/{usuarioId}")
    @Operation(summary = "Listar notificaciones de un usuario (más recientes primero)")
    public List<Notificacion> listarPorUsuario(@PathVariable UUID usuarioId) {
        return notificacionRepository.findByUsuarioIdOrderByCreatedAtDesc(usuarioId);
    }

    @PatchMapping("/{id}/leer")
    @Transactional
    @Operation(summary = "Marcar una notificación como leída")
    public Notificacion marcarLeida(@PathVariable UUID id) {
        Notificacion n = notificacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
        n.setLeida(true);
        return notificacionRepository.save(n);
    }
}
