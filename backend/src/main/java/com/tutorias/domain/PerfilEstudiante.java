package com.tutorias.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "perfiles_estudiante")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PerfilEstudiante {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(unique = true, nullable = false)
    private String matricula;

    @Column(nullable = false)
    private String carrera;

    @Column(nullable = false)
    private Integer semestre;

    @Column(name = "promedio_general", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal promedioGeneral = BigDecimal.ZERO;

    @Column(name = "creditos_aprobados")
    @Builder.Default
    private Integer creditosAprobados = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}