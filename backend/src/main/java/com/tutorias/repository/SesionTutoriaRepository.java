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
}