package com.tutorias.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad de Dominio: Certificación de un tutor.
 * Reemplaza el antiguo ElementCollection de Strings por una entidad 1:N con atributos propios.
 */
@Entity
@Table(name = "certificaciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Certificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "perfil_tutor_id", nullable = false)
    private PerfilTutor perfilTutor;

    @Column(nullable = false)
    private String nombre;

    private String institucion;

    private Integer anio;

    @Column(name = "url_credencial", columnDefinition = "TEXT")
    private String urlCredencial;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
