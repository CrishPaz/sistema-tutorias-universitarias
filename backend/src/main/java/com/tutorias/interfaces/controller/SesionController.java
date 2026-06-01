package com.tutorias.interfaces.controller;

import com.tutorias.application.service.SesionService;
import com.tutorias.domain.SesionTutoria;
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
    public ResponseEntity<SesionTutoria> reservar(
            @RequestParam UUID estudianteId,
            @RequestParam UUID tutorId,
            @RequestParam UUID materiaId,
            @RequestParam String fechaInicio, // ISO format
            @RequestParam(defaultValue = "60") Integer duracion,
            @RequestParam(defaultValue = "VIRTUAL") String modalidad,
            @RequestParam(required = false) String notas) {

        LocalDateTime inicio = LocalDateTime.parse(fechaInicio);
        SesionTutoria sesion = sesionService.reservarSesion(estudianteId, tutorId, materiaId, inicio, duracion, modalidad, notas);
        return ResponseEntity.ok(sesion);
    }

    @GetMapping("/estudiante/{estudianteId}")
    @PreAuthorize("hasAnyRole('ESTUDIANTE', 'ADMIN')")
    public ResponseEntity<List<SesionTutoria>> obtenerPorEstudiante(@PathVariable UUID estudianteId) {
        return ResponseEntity.ok(sesionService.obtenerSesionesEstudiante(estudianteId));
    }

    @GetMapping("/tutor/{tutorId}")
    @PreAuthorize("hasAnyRole('TUTOR', 'ADMIN')")
    public ResponseEntity<List<SesionTutoria>> obtenerPorTutor(@PathVariable UUID tutorId) {
        return ResponseEntity.ok(sesionService.obtenerSesionesTutor(tutorId));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('TUTOR', 'ADMIN')")
    public ResponseEntity<SesionTutoria> actualizarEstado(
            @PathVariable UUID id,
            @RequestParam SesionTutoria.EstadoSesion estado) {
        return ResponseEntity.ok(sesionService.actualizarEstado(id, estado));
    }

    @PostMapping("/{id}/calificar")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    @Operation(summary = "El estudiante califica el servicio de tutoría (1-5) y deja una reseña")
    public ResponseEntity<SesionTutoria> calificar(
            @PathVariable UUID id,
            @RequestParam Integer calificacion,
            @RequestParam(required = false) String resena) {
        return ResponseEntity.ok(sesionService.calificarSesion(id, calificacion, resena));
    }

    @PostMapping("/{id}/nota-academica")
    @PreAuthorize("hasRole('TUTOR')")
    @Operation(summary = "El tutor asigna la nota académica al estudiante (0-20) y deja una reseña")
    public ResponseEntity<SesionTutoria> notaAcademica(
            @PathVariable UUID id,
            @RequestParam BigDecimal nota,
            @RequestParam(required = false) String resena) {
        return ResponseEntity.ok(sesionService.calificarAcademico(id, nota, resena));
    }
}