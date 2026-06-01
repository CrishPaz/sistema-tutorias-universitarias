package com.tutorias.interfaces.controller;

import com.tutorias.domain.Mensaje;
import com.tutorias.domain.SesionTutoria;
import com.tutorias.exceptions.NotFoundException;
import com.tutorias.repository.MensajeRepository;
import com.tutorias.repository.SesionTutoriaRepository;
import com.tutorias.security.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Chat interno por sesión de tutoría (con stream SSE para tiempo real).
 */
@RestController
@RequestMapping("/mensajes")
@RequiredArgsConstructor
@Tag(name = "Mensajes", description = "Chat interno entre estudiante y tutor por sesión")
public class MensajeController {

    private final MensajeRepository mensajeRepository;
    private final SesionTutoriaRepository sesionRepository;
    private final JwtUtil jwtUtil;

    /** Emitters SSE conectados por sesión. */
    private final Map<UUID, CopyOnWriteArrayList<SseEmitter>> emitters = new ConcurrentHashMap<>();

    @GetMapping("/{sesionId}")
    @Operation(summary = "Listar los mensajes de una sesión (orden cronológico)")
    public List<Mensaje> listarPorSesion(@PathVariable UUID sesionId) {
        return mensajeRepository.findBySesionIdOrderByCreatedAtAsc(sesionId);
    }

    /**
     * Stream SSE de nuevos mensajes de una sesión. EventSource no puede enviar el
     * header Authorization, por eso el JWT viaja por query-param y se valida aquí.
     * Esta ruta es permitAll en SecurityConfig.
     */
    @GetMapping("/stream/{sesionId}")
    @Operation(summary = "Suscribirse (SSE) a los mensajes nuevos de una sesión")
    public SseEmitter stream(@PathVariable UUID sesionId, @RequestParam String token) {
        try {
            jwtUtil.extractUsername(token); // valida firma y expiración; lanza si es inválido
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido o expirado");
        }

        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L); // 30 min
        emitters.computeIfAbsent(sesionId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        Runnable remove = () -> {
            CopyOnWriteArrayList<SseEmitter> list = emitters.get(sesionId);
            if (list != null) list.remove(emitter);
        };
        emitter.onCompletion(remove);
        emitter.onTimeout(remove);
        emitter.onError(e -> remove.run());

        try {
            emitter.send(SseEmitter.event().name("conectado").data("ok"));
        } catch (IOException ignored) {
        }
        return emitter;
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

        Mensaje mensaje = mensajeRepository.save(Mensaje.builder()
                .sesionId(sesionId)
                .remitenteId(remitenteId)
                .destinatarioId(destinatarioId)
                .contenido(contenido)
                .leido(false)
                .build());

        // Notificar a los suscriptores SSE de esta sesión
        CopyOnWriteArrayList<SseEmitter> list = emitters.get(sesionId);
        if (list != null) {
            for (SseEmitter em : list) {
                try {
                    em.send(SseEmitter.event().name("mensaje").data(mensaje));
                } catch (IOException e) {
                    em.complete();
                }
            }
        }
        return mensaje;
    }
}
