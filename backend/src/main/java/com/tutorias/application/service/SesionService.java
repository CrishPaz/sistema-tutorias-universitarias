package com.tutorias.application.service;

import com.tutorias.domain.*;
import com.tutorias.repository.MateriaRepository;
import com.tutorias.repository.PerfilEstudianteRepository;
import com.tutorias.repository.PerfilTutorRepository;
import com.tutorias.repository.SesionTutoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
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

        LocalDateTime fechaFin = fechaInicio.plusMinutes(duracionMinutos);

        // 1) No reservar en el pasado
        if (fechaInicio.isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No puedes reservar una sesión en el pasado");
        }

        // 2) Debe caer dentro de la disponibilidad del tutor (si tiene horarios configurados)
        validarDisponibilidad(tutor, fechaInicio, fechaFin);

        // 3) Sin solapamiento con otras sesiones del tutor ni del estudiante
        SesionTutoria.EstadoSesion cancelada = SesionTutoria.EstadoSesion.CANCELADA;
        if (sesionRepository.contarSolapadasTutor(tutor.getId(), fechaInicio, fechaFin, cancelada) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El tutor ya tiene una sesión reservada en ese horario");
        }
        if (sesionRepository.contarSolapadasEstudiante(estudiante.getId(), fechaInicio, fechaFin, cancelada) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya tienes otra sesión reservada en ese horario");
        }

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

    /**
     * Verifica que [inicio, fin] caiga dentro de algún bloque de disponibilidad del tutor.
     * Si el tutor no tiene disponibilidad configurada, no se restringe el horario.
     */
    private void validarDisponibilidad(PerfilTutor tutor, LocalDateTime inicio, LocalDateTime fin) {
        List<Disponibilidad> bloques = tutor.getDisponibilidades();
        if (bloques == null || bloques.isEmpty()) {
            return; // sin horarios definidos -> no se valida (evita bloquear tutores no configurados)
        }
        Disponibilidad.DiaSemana dia = aDiaSemana(inicio.getDayOfWeek());
        LocalTime horaInicio = inicio.toLocalTime();
        LocalTime horaFin = fin.toLocalTime();

        boolean dentro = bloques.stream().anyMatch(b ->
                b.getDiaSemana() == dia
                        && !horaInicio.isBefore(b.getHoraInicio())
                        && !horaFin.isAfter(b.getHoraFin()));

        if (!dentro) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "El tutor no está disponible en ese día/horario");
        }
    }

    private Disponibilidad.DiaSemana aDiaSemana(DayOfWeek d) {
        return switch (d) {
            case MONDAY -> Disponibilidad.DiaSemana.LUNES;
            case TUESDAY -> Disponibilidad.DiaSemana.MARTES;
            case WEDNESDAY -> Disponibilidad.DiaSemana.MIERCOLES;
            case THURSDAY -> Disponibilidad.DiaSemana.JUEVES;
            case FRIDAY -> Disponibilidad.DiaSemana.VIERNES;
            case SATURDAY -> Disponibilidad.DiaSemana.SABADO;
            case SUNDAY -> Disponibilidad.DiaSemana.DOMINGO;
        };
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