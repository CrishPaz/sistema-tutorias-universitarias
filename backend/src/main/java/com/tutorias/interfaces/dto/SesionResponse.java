package com.tutorias.interfaces.dto;

import com.tutorias.domain.PerfilEstudiante;
import com.tutorias.domain.PerfilTutor;
import com.tutorias.domain.SesionTutoria;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de respuesta para sesiones. Evita exponer las entidades JPA completas
 * (que filtrarían email/teléfono/estado de la otra parte) y elimina la
 * dependencia de la serialización de proxies lazy de Hibernate.
 */
public record SesionResponse(
        UUID id,
        String estado,
        String modalidad,
        LocalDateTime fechaHoraInicio,
        LocalDateTime fechaHoraFin,
        Long duracionMinutos,
        BigDecimal precio,
        String enlaceReunion,
        String ubicacion,
        Integer calificacionEstudiante,
        String resenaEstudiante,
        BigDecimal notaAcademica,
        String resenaTutor,
        MateriaMini materia,
        PerfilMini tutor,
        PerfilMini estudiante
) {
    public record MateriaMini(UUID id, String codigo, String nombre) {}
    public record UsuarioMini(UUID id, String nombreCompleto) {}
    public record PerfilMini(UUID id, UsuarioMini usuario) {}

    public static SesionResponse from(SesionTutoria s) {
        return new SesionResponse(
                s.getId(),
                s.getEstado() != null ? s.getEstado().name() : null,
                s.getModalidad() != null ? s.getModalidad().name() : null,
                s.getFechaHoraInicio(),
                s.getFechaHoraFin(),
                s.getDuracionMinutos(),
                s.getPrecio(),
                s.getEnlaceReunion(),
                s.getUbicacion(),
                s.getCalificacionEstudiante(),
                s.getResenaEstudiante(),
                s.getNotaAcademica(),
                s.getResenaTutor(),
                s.getMateria() != null
                        ? new MateriaMini(s.getMateria().getId(), s.getMateria().getCodigo(), s.getMateria().getNombre())
                        : null,
                fromTutor(s.getTutor()),
                fromEstudiante(s.getEstudiante())
        );
    }

    private static PerfilMini fromTutor(PerfilTutor t) {
        if (t == null) return null;
        return new PerfilMini(t.getId(), t.getUsuario() != null
                ? new UsuarioMini(t.getUsuario().getId(), t.getUsuario().getNombreCompleto()) : null);
    }

    private static PerfilMini fromEstudiante(PerfilEstudiante e) {
        if (e == null) return null;
        return new PerfilMini(e.getId(), e.getUsuario() != null
                ? new UsuarioMini(e.getUsuario().getId(), e.getUsuario().getNombreCompleto()) : null);
    }
}
