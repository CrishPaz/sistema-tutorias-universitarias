package com.tutorias.repository;

import com.tutorias.domain.SesionTutoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SesionTutoriaRepository extends JpaRepository<SesionTutoria, UUID> {

    List<SesionTutoria> findByEstudianteId(UUID estudianteId);

    List<SesionTutoria> findByTutorId(UUID tutorId);

    // El frontend identifica al usuario por su id de usuario, no por el id de perfil
    List<SesionTutoria> findByEstudianteUsuarioId(UUID usuarioId);

    List<SesionTutoria> findByTutorUsuarioId(UUID usuarioId);

    @Query("SELECT s FROM SesionTutoria s WHERE s.tutor.id = :tutorId AND s.fechaHoraInicio BETWEEN :inicio AND :fin")
    List<SesionTutoria> findByTutorAndFechaBetween(@Param("tutorId") UUID tutorId,
                                                    @Param("inicio") LocalDateTime inicio,
                                                    @Param("fin") LocalDateTime fin);

    @Query("SELECT s FROM SesionTutoria s WHERE s.estado = 'PENDIENTE' AND s.fechaHoraInicio > :ahora")
    List<SesionTutoria> findSesionesPendientesFuturas(@Param("ahora") LocalDateTime ahora);

    // --- Métricas del tutor (recalculadas desde las sesiones) ---

    long countByTutorIdAndEstado(UUID tutorId, SesionTutoria.EstadoSesion estado);

    @Query("SELECT AVG(s.calificacionEstudiante) FROM SesionTutoria s " +
           "WHERE s.tutor.id = :tutorId AND s.calificacionEstudiante IS NOT NULL")
    Double promedioCalificacionTutor(@Param("tutorId") UUID tutorId);

    // --- Validación de solapamiento de horarios (dos intervalos chocan si inicioA < finB && finA > inicioB) ---

    @Query("SELECT count(s) FROM SesionTutoria s WHERE s.tutor.id = :tutorId " +
           "AND s.estado <> :cancelada AND s.fechaHoraInicio < :fin AND s.fechaHoraFin > :inicio")
    long contarSolapadasTutor(@Param("tutorId") UUID tutorId,
                              @Param("inicio") LocalDateTime inicio,
                              @Param("fin") LocalDateTime fin,
                              @Param("cancelada") SesionTutoria.EstadoSesion cancelada);

    @Query("SELECT count(s) FROM SesionTutoria s WHERE s.estudiante.id = :estudianteId " +
           "AND s.estado <> :cancelada AND s.fechaHoraInicio < :fin AND s.fechaHoraFin > :inicio")
    long contarSolapadasEstudiante(@Param("estudianteId") UUID estudianteId,
                                   @Param("inicio") LocalDateTime inicio,
                                   @Param("fin") LocalDateTime fin,
                                   @Param("cancelada") SesionTutoria.EstadoSesion cancelada);

    // --- Reportes (admin) ---

    @Query("SELECT s.estado, count(s) FROM SesionTutoria s GROUP BY s.estado")
    List<Object[]> contarPorEstado();

    @Query("SELECT COALESCE(SUM(s.precio), 0) FROM SesionTutoria s WHERE s.estado = com.tutorias.domain.SesionTutoria.EstadoSesion.COMPLETADA")
    java.math.BigDecimal ingresosCompletadas();
}