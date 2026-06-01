package com.tutorias.repository;

import com.tutorias.domain.Disponibilidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DisponibilidadRepository extends JpaRepository<Disponibilidad, UUID> {
    List<Disponibilidad> findByPerfilTutorId(UUID perfilTutorId);
}
