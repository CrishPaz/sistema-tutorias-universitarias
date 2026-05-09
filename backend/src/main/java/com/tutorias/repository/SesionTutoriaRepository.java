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

    @Query("SELECT s FROM SesionTutoria s WHERE s.tutor.id = :tutorId AND s.fechaHoraInicio BETWEEN :inicio AND :fin")
    List<SesionTutoria> findByTutorAndFechaBetween(@Param("tutorId") UUID tutorId,
                                                    @Param("inicio") LocalDateTime inicio,
                                                    @Param("fin") LocalDateTime fin);

    @Query("SELECT s FROM SesionTutoria s WHERE s.estado = 'PENDIENTE' AND s.fechaHoraInicio > :ahora")
    List<SesionTutoria> findSesionesPendientesFuturas(@Param("ahora") LocalDateTime ahora);
}