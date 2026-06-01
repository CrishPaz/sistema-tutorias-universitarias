package com.tutorias.interfaces.controller;

import com.tutorias.application.service.SesionService;
import com.tutorias.domain.SesionTutoria;
import com.tutorias.interfaces.dto.SesionResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Controlador de Sesiones de Tutoría
 */
@RestController
@RequestMapping("/sesiones")
@RequiredArgsConstructor
@Tag(name = "Sesiones de Tutoría", description = "Gestión completa de reservas y sesiones")
public class SesionController {

    private final SesionService sesionService;

    @PostMapping("/reservar")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    @Operation(summary = "Reservar nueva sesión de tutoría")
    public ResponseEntity<SesionResponse> reservar(
            @RequestParam UUID estudianteId,
            @RequestParam UUID tutorId,
            @RequestParam UUID materiaId,
            @RequestParam String fechaInicio, // ISO format
            @RequestParam(defaultValue = "60") Integer duracion,
            @RequestParam(defaultValue = "VIRTUAL") String modalidad,
            @RequestParam(required = false) String notas) {

        LocalDateTime inicio = LocalDateTime.parse(fechaInicio);
        SesionTutoria sesion = sesionService.reservarSesion(estudianteId, tutorId, materiaId, inicio, duracion, modalidad, notas);
        return ResponseEntity.ok(SesionResponse.from(sesion));
    }

    @GetMapping("/estudiante/{estudianteId}")
    @PreAuthorize("hasAnyRole('ESTUDIANTE', 'ADMIN')")
    public ResponseEntity<List<SesionResponse>> obtenerPorEstudiante(@PathVariable UUID estudianteId) {
        return ResponseEntity.ok(sesionService.obtenerSesionesEstudiante(estudianteId)
                .stream().map(SesionResponse::from).collect(Collectors.toList()));
    }

    @GetMapping("/tutor/{tutorId}")
    @PreAuthorize("hasAnyRole('TUTOR', 'ADMIN')")
    public ResponseEntity<List<SesionResponse>> obtenerPorTutor(@PathVariable UUID tutorId) {
        return ResponseEntity.ok(sesionService.obtenerSesionesTutor(tutorId)
                .stream().map(SesionResponse::from).collect(Collectors.toList()));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('TUTOR', 'ADMIN')")
    public ResponseEntity<SesionResponse> actualizarEstado(
            @PathVariable UUID id,
            @RequestParam SesionTutoria.EstadoSesion estado) {
        return ResponseEntity.ok(SesionResponse.from(sesionService.actualizarEstado(id, estado)));
    }

    @PostMapping("/{id}/calificar")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    @Operation(summary = "El estudiante califica el servicio de tutoría (1-5) y deja una reseña")
    public ResponseEntity<SesionResponse> calificar(
            @PathVariable UUID id,
            @RequestParam Integer calificacion,
            @RequestParam(required = false) String resena) {
        return ResponseEntity.ok(SesionResponse.from(sesionService.calificarSesion(id, calificacion, resena)));
    }

    @PostMapping("/{id}/nota-academica")
    @PreAuthorize("hasRole('TUTOR')")
    @Operation(summary = "El tutor asigna la nota académica al estudiante (0-20) y deja una reseña")
    public ResponseEntity<SesionResponse> notaAcademica(
            @PathVariable UUID id,
            @RequestParam BigDecimal nota,
            @RequestParam(required = false) String resena) {
        return ResponseEntity.ok(SesionResponse.from(sesionService.calificarAcademico(id, nota, resena)));
    }
}