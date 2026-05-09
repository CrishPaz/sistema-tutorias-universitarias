package com.tutorias.interfaces.dto;

import com.tutorias.domain.Usuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para registro de nuevos usuarios
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Debe ser un email válido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;

    @NotBlank(message = "El nombre completo es obligatorio")
    @Size(min = 3, max = 100)
    private String nombreCompleto;

    private String telefono;

    private Usuario.Rol rol; // ESTUDIANTE o TUTOR (ADMIN solo por backend)

    // Campos adicionales para estudiante (opcionales)
    private String matricula;
    private String carrera;
    private Integer semestre = 1;

    // Campos adicionales para tutor (opcionales)
    private String especialidad;
    private String tituloAcademico;
    private Integer anosExperiencia = 0;
}