package com.tutorias.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "perfiles_tutor")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PerfilTutor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column
    private String especialidad;

    @Column(name = "titulo_academico")
    private String tituloAcademico;

    @Column(name = "anos_experiencia")
    @Builder.Default
    private Integer anosExperiencia = 0;

    @Column(name = "tarifa_hora", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal tarifaHora = BigDecimal.ZERO;

    @Column(name = "calificacion_promedio", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal calificacionPromedio = new BigDecimal("5.00");

    @Column(name = "total_sesiones")
    @Builder.Default
    private Integer totalSesiones = 0;

    @OneToMany(mappedBy = "perfilTutor", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Disponibilidad> disponibilidades = new ArrayList<>();

    @OneToMany(mappedBy = "perfilTutor", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Certificacion> certificaciones = new ArrayList<>();

    @Builder.Default
    private Boolean verificado = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}