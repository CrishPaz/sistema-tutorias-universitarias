package com.tutorias.interfaces.controller;

import com.tutorias.domain.PerfilEstudiante;
import com.tutorias.domain.Usuario;
import com.tutorias.exceptions.NotFoundException;
import com.tutorias.repository.PerfilEstudianteRepository;
import com.tutorias.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/estudiantes")
@RequiredArgsConstructor
@Tag(name = "Estudiantes", description = "Perfil del estudiante")
public class EstudianteController {

    private final PerfilEstudianteRepository perfilEstudianteRepository;
    private final UsuarioRepository usuarioRepository;

    /** Solo el dueño (o ADMIN) puede modificar su perfil. */
    private void verificarPropietario(UUID usuarioIdPath) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean esAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (esAdmin) return;
        UUID propio = usuarioRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"))
                .getId();
        if (!propio.equals(usuarioIdPath)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "No puedes modificar el perfil de otro usuario");
        }
    }

    @GetMapping("/perfil/{usuarioId}")
    @Operation(summary = "Obtener el perfil de un estudiante por id de usuario")
    public PerfilEstudiante obtenerPerfil(@PathVariable String usuarioId) {
        UUID uuid = UUID.fromString(usuarioId);
        return perfilEstudianteRepository.findByUsuarioId(uuid)
                .orElseThrow(() -> new NotFoundException("Perfil de estudiante no encontrado"));
    }

    @PutMapping("/perfil/{usuarioId}")
    @PreAuthorize("hasAnyRole('ESTUDIANTE','ADMIN')")
    @Transactional
    @Operation(summary = "Actualizar el perfil del estudiante (biografía/foto van en usuario)")
    public PerfilEstudiante actualizarPerfil(@PathVariable String usuarioId, @RequestBody Map<String, Object> datos) {
        UUID uuid = UUID.fromString(usuarioId);
        verificarPropietario(uuid);

        PerfilEstudiante perfil = perfilEstudianteRepository.findByUsuarioId(uuid)
                .orElseThrow(() -> new NotFoundException("Perfil de estudiante no encontrado"));

        if (datos.get("carrera") != null) perfil.setCarrera(datos.get("carrera").toString());
        if (datos.get("semestre") != null) perfil.setSemestre(Integer.parseInt(datos.get("semestre").toString()));
        if (datos.get("promedioGeneral") != null) perfil.setPromedioGeneral(new BigDecimal(datos.get("promedioGeneral").toString()));

        // biografia y fotoUrl viven en Usuario (compartidos)
        if (datos.get("biografia") != null || datos.get("fotoUrl") != null) {
            Usuario usuario = usuarioRepository.findById(uuid)
                    .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
            if (datos.get("biografia") != null) usuario.setBiografia(datos.get("biografia").toString());
            if (datos.get("fotoUrl") != null) usuario.setFotoUrl(datos.get("fotoUrl").toString());
            usuarioRepository.save(usuario);
        }

        return perfilEstudianteRepository.save(perfil);
    }
}
