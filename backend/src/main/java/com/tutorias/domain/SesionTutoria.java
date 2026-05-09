package com.tutorias.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad de Dominio: Sesión de Tutoría
 * Core del negocio - Gestión de reservas y sesiones
 */
@Entity
@Table(name = "sesiones_tutoria")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE sesiones_tutoria SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@Where(clause = "deleted_at IS NULL")
public class SesionTutoria {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estudiante_id", nullable = false)
    private PerfilEstudiante estudiante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_id", nullable = false)
    private PerfilTutor tutor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materia_id", nullable = false)
    private Materia materia;

    @Column(name = "fecha_hora_inicio", nullable = false)
    private LocalDateTime fechaHoraInicio;

    @Column(name = "fecha_hora_fin", nullable = false)
    private LocalDateTime fechaHoraFin;

    @Column(name = "duracion_minutos")
    @Builder.Default
    private Integer duracionMinutos = 60;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EstadoSesion estado = EstadoSesion.PENDIENTE;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Modalidad modalidad = Modalidad.VIRTUAL;

    @Column(name = "enlace_reunion")
    private String enlaceReunion;

    private String ubicacion;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal precio = BigDecimal.ZERO;

    @Column(name = "notas_estudiante", columnDefinition = "TEXT")
    private String notasEstudiante;

    @Column(name = "notas_tutor", columnDefinition = "TEXT")
    private String notasTutor;

    @Column(name = "calificacion_estudiante")
    private Integer calificacionEstudiante; // 1-5

    @Column(name = "comentario_calificacion", columnDefinition = "TEXT")
    private String comentarioCalificacion;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public enum EstadoSesion {
        PENDIENTE, CONFIRMADA, EN_PROGRESO, COMPLETADA, CANCELADA, NO_ASISTIO
    }

    public enum Modalidad {
        VIRTUAL, PRESENCIAL, HIBRIDA
    }
}