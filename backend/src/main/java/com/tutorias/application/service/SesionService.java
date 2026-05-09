package com.tutorias.application.service;

import com.tutorias.domain.*;
import com.tutorias.repository.PerfilEstudianteRepository;
import com.tutorias.repository.PerfilTutorRepository;
import com.tutorias.repository.SesionTutoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Servicio de Sesiones de Tutoría (Core Business Logic)
 */
@Service
@RequiredArgsConstructor
public class SesionService {

    private final SesionTutoriaRepository sesionRepository;
    private final PerfilEstudianteRepository estudianteRepository;
    private final PerfilTutorRepository tutorRepository;

    @Transactional
    public SesionTutoria reservarSesion(UUID estudianteId, UUID tutorId, UUID materiaId,
                                        LocalDateTime fechaInicio, Integer duracionMinutos,
                                        String modalidad, String notas) {

        PerfilEstudiante estudiante = estudianteRepository.findById(estudianteId)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        PerfilTutor tutor = tutorRepository.findById(tutorId)
                .orElseThrow(() -> new RuntimeException("Tutor no encontrado"));

        // Validar disponibilidad (simplificado - en producción usar calendario real)
        LocalDateTime fechaFin = fechaInicio.plusMinutes(duracionMinutos);

        SesionTutoria sesion = SesionTutoria.builder()
                .estudiante(estudiante)
                .tutor(tutor)
                .materia(new Materia()) // Se asigna en controller
                .fechaHoraInicio(fechaInicio)
                .fechaHoraFin(fechaFin)
                .duracionMinutos(duracionMinutos)
                .estado(SesionTutoria.EstadoSesion.PENDIENTE)
                .modalidad(SesionTutoria.Modalidad.valueOf(modalidad.toUpperCase()))
                .precio(tutor.getTarifaHora().multiply(BigDecimal.valueOf(duracionMinutos / 60.0)))
                .notasEstudiante(notas)
                .build();

        return sesionRepository.save(sesion);
    }

    public List<SesionTutoria> obtenerSesionesEstudiante(UUID estudianteId) {
        return sesionRepository.findByEstudianteId(estudianteId);
    }

    public List<SesionTutoria> obtenerSesionesTutor(UUID tutorId) {
        return sesionRepository.findByTutorId(tutorId);
    }

    @Transactional
    public SesionTutoria actualizarEstado(UUID sesionId, SesionTutoria.EstadoSesion nuevoEstado) {
        SesionTutoria sesion = sesionRepository.findById(sesionId)
                .orElseThrow(() -> new RuntimeException("Sesión no encontrada"));

        sesion.setEstado(nuevoEstado);

        if (nuevoEstado == SesionTutoria.EstadoSesion.COMPLETADA) {
            // Incrementar contador del tutor
            PerfilTutor tutor = sesion.getTutor();
            tutor.setTotalSesiones(tutor.getTotalSesiones() + 1);
            // Lógica de calificación promedio aquí...
        }

        return sesionRepository.save(sesion);
    }

    @Transactional
    public SesionTutoria calificarSesion(UUID sesionId, Integer calificacion, String comentario) {
        SesionTutoria sesion = sesionRepository.findById(sesionId)
                .orElseThrow(() -> new RuntimeException("Sesión no encontrada"));

        if (sesion.getEstado() != SesionTutoria.EstadoSesion.COMPLETADA) {
            throw new RuntimeException("Solo se pueden calificar sesiones completadas");
        }

        sesion.setCalificacionEstudiante(calificacion);
        sesion.setComentarioCalificacion(comentario);

        return sesionRepository.save(sesion);
    }
}