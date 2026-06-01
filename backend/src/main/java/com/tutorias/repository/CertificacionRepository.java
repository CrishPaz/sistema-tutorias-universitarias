package com.tutorias.repository;

import com.tutorias.domain.Certificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CertificacionRepository extends JpaRepository<Certificacion, UUID> {
    List<Certificacion> findByPerfilTutorId(UUID perfilTutorId);
}
