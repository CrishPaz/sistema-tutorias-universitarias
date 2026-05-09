package com.tutorias.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "perfiles_tutor")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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

    @Column(columnDefinition = "jsonb")
    private String disponibilidad; // JSON con horarios

    @ElementCollection
    @CollectionTable(name = "tutor_certificaciones", joinColumns = @JoinColumn(name = "perfil_tutor_id"))
    @Column(name = "certificacion")
    private List<String> certificaciones;

    @Column(name = "foto_url")
    private String fotoUrl;

    @Column(columnDefinition = "TEXT")
    private String biografia;

    @Builder.Default
    private Boolean verificado = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}