package com.tutorias.interfaces.controller;

import com.tutorias.domain.PerfilTutor;
import com.tutorias.repository.PerfilTutorRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tutores")
@RequiredArgsConstructor
@Tag(name = "Tutores", description = "Gestión de tutores")
public class TutorController {

    private final PerfilTutorRepository perfilTutorRepository;

    @GetMapping
    public List<PerfilTutor> obtenerTodos() {
        return perfilTutorRepository.findAll();
    }

    @GetMapping("/perfil/{usuarioId}")
    public PerfilTutor obtenerPerfil(@PathVariable String usuarioId) {
        java.util.UUID uuid = java.util.UUID.fromString(usuarioId);
        return perfilTutorRepository.findByUsuarioId(uuid)
                .orElseGet(() -> {
                    PerfilTutor nuevo = new PerfilTutor();
                    com.tutorias.domain.Usuario usuario = new com.tutorias.domain.Usuario();
                    usuario.setId(uuid);
                    nuevo.setUsuario(usuario);
                    nuevo.setEspecialidad("Sin especialidad");
                    nuevo.setTarifaHora(java.math.BigDecimal.ZERO);
                    nuevo.setAnosExperiencia(0);
                    // No guardar para evitar errores de constraint
                    return nuevo;
                });
    }

    @PutMapping("/perfil/{usuarioId}")
    public PerfilTutor actualizarPerfil(@PathVariable String usuarioId, @RequestBody java.util.Map<String, Object> datos) {
        PerfilTutor perfil = perfilTutorRepository.findByUsuarioId(java.util.UUID.fromString(usuarioId))
                .orElseGet(() -> {
                    PerfilTutor nuevo = new PerfilTutor();
                    com.tutorias.domain.Usuario usuario = new com.tutorias.domain.Usuario();
                    usuario.setId(java.util.UUID.fromString(usuarioId));
                    nuevo.setUsuario(usuario);
                    return nuevo;
                });
        
        if (datos.get("especialidad") != null) perfil.setEspecialidad(datos.get("especialidad").toString());
        if (datos.get("tituloAcademico") != null) perfil.setTituloAcademico(datos.get("tituloAcademico").toString());
        if (datos.get("anosExperiencia") != null) perfil.setAnosExperiencia(Integer.parseInt(datos.get("anosExperiencia").toString()));
        if (datos.get("tarifaHora") != null) perfil.setTarifaHora(new java.math.BigDecimal(datos.get("tarifaHora").toString()));
        if (datos.get("biografia") != null) perfil.setBiografia(datos.get("biografia").toString());
        
        return perfilTutorRepository.save(perfil);
    }

    @PatchMapping("/disponibilidad/{usuarioId}")
    public PerfilTutor actualizarDisponibilidad(@PathVariable String usuarioId, @RequestBody java.util.Map<String, Object> body) {
        PerfilTutor perfil = perfilTutorRepository.findByUsuarioId(java.util.UUID.fromString(usuarioId))
                .orElseGet(() -> {
                    PerfilTutor nuevo = new PerfilTutor();
                    com.tutorias.domain.Usuario usuario = new com.tutorias.domain.Usuario();
                    usuario.setId(java.util.UUID.fromString(usuarioId));
                    nuevo.setUsuario(usuario);
                    return nuevo;
                });
        
        if (body.get("disponibilidad") != null) {
            perfil.setDisponibilidad(body.get("disponibilidad").toString());
        }
        return perfilTutorRepository.save(perfil);
    }
}