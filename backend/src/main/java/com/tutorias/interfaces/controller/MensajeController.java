package com.tutorias.interfaces.controller;

import com.tutorias.domain.Mensaje;
import com.tutorias.domain.SesionTutoria;
import com.tutorias.exceptions.NotFoundException;
import com.tutorias.repository.MensajeRepository;
import com.tutorias.repository.SesionTutoriaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Chat interno por sesión de tutoría.
 */
@RestController
@RequestMapping("/mensajes")
@RequiredArgsConstructor
@Tag(name = "Mensajes", description = "Chat interno entre estudiante y tutor por sesión")
public class MensajeController {

    private final MensajeRepository mensajeRepository;
    private final SesionTutoriaRepository sesionRepository;

    @GetMapping("/{sesionId}")
    @Operation(summary = "Listar los mensajes de una sesión (orden cronológico)")
    public List<Mensaje> listarPorSesion(@PathVariable UUID sesionId) {
        return mensajeRepository.findBySesionIdOrderByCreatedAtAsc(sesionId);
    }

    @PostMapping
    @Transactional
    @Operation(summary = "Enviar un mensaje; el destinatario se deriva de la sesión")
    public Mensaje enviar(@RequestBody Map<String, Object> body) {
        UUID sesionId = UUID.fromString(body.get("sesion_id").toString());
        UUID remitenteId = UUID.fromString(body.get("remitente_id").toString());
        String contenido = body.getOrDefault("contenido", "").toString();

        SesionTutoria sesion = sesionRepository.findById(sesionId)
                .orElseThrow(() -> new NotFoundException("Sesión no encontrada"));

        UUID estudianteUserId = sesion.getEstudiante().getUsuario().getId();
        UUID tutorUserId = sesion.getTutor().getUsuario().getId();
        UUID destinatarioId = remitenteId.equals(estudianteUserId) ? tutorUserId : estudianteUserId;

        Mensaje mensaje = Mensaje.builder()
                .sesionId(sesionId)
                .remitenteId(remitenteId)
                .destinatarioId(destinatarioId)
                .contenido(contenido)
                .leido(false)
                .build();

        return mensajeRepository.save(mensaje);
    }
}
