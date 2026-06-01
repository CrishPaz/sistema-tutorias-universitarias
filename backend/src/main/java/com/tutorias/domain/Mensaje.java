package com.tutorias.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad de Dominio: Mensaje (chat interno por sesión).
 * Los IDs se guardan como columnas planas; el JSON usa snake_case para el frontend.
 */
@Entity
@Table(name = "mensajes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mensaje {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JsonProperty("sesion_id")
    @Column(name = "sesion_id")
    private UUID sesionId;

    @JsonProperty("remitente_id")
    @Column(name = "remitente_id", nullable = false)
    private UUID remitenteId;

    @JsonProperty("destinatario_id")
    @Column(name = "destinatario_id", nullable = false)
    private UUID destinatarioId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenido;

    @Builder.Default
    private Boolean leido = false;

    @CreationTimestamp
    @JsonProperty("created_at")
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
