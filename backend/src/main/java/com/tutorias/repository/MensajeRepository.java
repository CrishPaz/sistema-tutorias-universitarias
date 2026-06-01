package com.tutorias.repository;

import com.tutorias.domain.Mensaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MensajeRepository extends JpaRepository<Mensaje, UUID> {
    List<Mensaje> findBySesionIdOrderByCreatedAtAsc(UUID sesionId);
}
