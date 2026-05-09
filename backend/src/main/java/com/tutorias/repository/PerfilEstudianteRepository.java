package com.tutorias.repository;

import com.tutorias.domain.PerfilEstudiante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PerfilEstudianteRepository extends JpaRepository<PerfilEstudiante, UUID> {
    Optional<PerfilEstudiante> findByUsuarioId(UUID usuarioId);
}