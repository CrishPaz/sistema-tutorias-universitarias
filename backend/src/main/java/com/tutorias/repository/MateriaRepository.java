package com.tutorias.repository;

import com.tutorias.domain.Materia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MateriaRepository extends JpaRepository<Materia, UUID> {
}