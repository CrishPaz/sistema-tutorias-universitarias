package com.tutorias.application.service;

import com.tutorias.domain.*;
import com.tutorias.repository.MateriaRepository;
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
    private final MateriaRepository materiaRepository;

    @Transactional
    public SesionTutoria reservarSesion(UUID estudianteId, UUID tutorId, UUID materiaId,
                                        LocalDateTime fechaInicio, Integer duracionMinutos,
                                        String modalidad, String notas) {

        // El frontend envía el id de USUARIO del estudiante (de localStorage)
        PerfilEstudiante estudiante = estudianteRepository.findByUsuarioId(estudianteId)
                .orElseGet(() -> estudianteRepository.findById(estudianteId)
                        .orElseThrow(() -> new RuntimeException("Estudiante no encontrado")));

        // El selector envía el id de PERFIL del tutor (de /tutores)
        PerfilTutor tutor = tutorRepository.findById(tutorId)
                .orElseThrow(() -> new RuntimeException("Tutor no encontrado"));

        Materia materia = materiaRepository.findById(materiaId)
                .orElseThrow(() -> new RuntimeException("Materia no encontrada"));

        // Validar disponibilidad (simplificado - en producción usar calendario real)
        LocalDateTime fechaFin = fechaInicio.plusMinutes(duracionMinutos);

        SesionTutoria sesion = SesionTutoria.builder()
                .estudiante(estudiante)
                .tutor(tutor)
                .materia(materia)
                .fechaHoraInicio(fechaInicio)
                .fechaHoraFin(fechaFin)
                .estado(SesionTutoria.EstadoSesion.PENDIENTE)
                .modalidad(SesionTutoria.Modalidad.valueOf(modalidad.toUpperCase()))
                .precio(tutor.getTarifaHora().multiply(BigDecimal.valueOf(duracionMinutos / 60.0)))
                .notasEstudiante(notas)
                .build();

        return sesionRepository.save(sesion);
    }

    public List<SesionTutoria> obtenerSesionesEstudiante(UUID usuarioId) {
        return sesionRepository.findByEstudianteUsuarioId(usuarioId);
    }

    public List<SesionTutoria> obtenerSesionesTutor(UUID usuarioId) {
        return sesionRepository.findByTutorUsuarioId(usuarioId);
    }

    @Transactional
    public SesionTutoria actualizarEstado(UUID sesionId, SesionTutoria.EstadoSesion nuevoEstado) {
        SesionTutoria sesion = sesionRepository.findById(sesionId)
                .orElseThrow(() -> new RuntimeException("Sesión no encontrada"));

        sesion.setEstado(nuevoEstado);
        SesionTutoria guardada = sesionRepository.save(sesion);

        // Recalcular métricas del tutor desde las sesiones (no incrementos manuales)
        recalcularMetricasTutor(sesion.getTutor());

        return guardada;
    }

    /**
     * Recalcula total_sesiones (sesiones COMPLETADAS) y calificacion_promedio
     * (media de las calificaciones del estudiante) directamente desde la BD.
     */
    @Transactional
    public void recalcularMetricasTutor(PerfilTutor tutor) {
        UUID tutorId = tutor.getId();
        long completadas = sesionRepository.countByTutorIdAndEstado(
                tutorId, SesionTutoria.EstadoSesion.COMPLETADA);
        Double promedio = sesionRepository.promedioCalificacionTutor(tutorId);

        tutor.setTotalSesiones((int) completadas);
        tutor.setCalificacionPromedio(
                promedio != null
                        ? BigDecimal.valueOf(promedio).setScale(2, java.math.RoundingMode.HALF_UP)
                        : new BigDecimal("5.00"));
        tutorRepository.save(tutor);
    }

    /**
     * Calificación del estudiante hacia el servicio de tutoría (nota 1-5 + reseña).
     */
    @Transactional
    public SesionTutoria calificarSesion(UUID sesionId, Integer calificacion, String resena) {
        SesionTutoria sesion = sesionRepository.findById(sesionId)
                .orElseThrow(() -> new RuntimeException("Sesión no encontrada"));

        if (sesion.getEstado() != SesionTutoria.EstadoSesion.COMPLETADA) {
            throw new RuntimeException("Solo se pueden calificar sesiones completadas");
        }

        sesion.setCalificacionEstudiante(calificacion);
        sesion.setResenaEstudiante(resena);
        SesionTutoria guardada = sesionRepository.save(sesion);

        // La calificación cambia el promedio del tutor
        recalcularMetricasTutor(sesion.getTutor());

        return guardada;
    }

    /**
     * Nota académica que el tutor asigna al estudiante (0-20) + reseña del tutor.
     */
    @Transactional
    public SesionTutoria calificarAcademico(UUID sesionId, BigDecimal notaAcademica, String resena) {
        SesionTutoria sesion = sesionRepository.findById(sesionId)
                .orElseThrow(() -> new RuntimeException("Sesión no encontrada"));

        if (sesion.getEstado() != SesionTutoria.EstadoSesion.COMPLETADA) {
            throw new RuntimeException("Solo se pueden calificar sesiones completadas");
        }

        sesion.setNotaAcademica(notaAcademica);
        sesion.setResenaTutor(resena);

        return sesionRepository.save(sesion);
    }
}