package com.tutorias.repository;

import com.tutorias.domain.PerfilTutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PerfilTutorRepository extends JpaRepository<PerfilTutor, UUID> {
    Optional<PerfilTutor> findByUsuarioId(UUID usuarioId);
    List<PerfilTutor> findByEspecialidadContainingIgnoreCase(String especialidad);
}