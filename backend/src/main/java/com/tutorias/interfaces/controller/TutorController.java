package com.tutorias.interfaces.controller;

import com.tutorias.domain.Certificacion;
import com.tutorias.domain.Disponibilidad;
import com.tutorias.domain.PerfilTutor;
import com.tutorias.domain.Usuario;
import com.tutorias.repository.PerfilTutorRepository;
import com.tutorias.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/tutores")
@RequiredArgsConstructor
@Tag(name = "Tutores", description = "Gestión de tutores")
public class TutorController {

    private final PerfilTutorRepository perfilTutorRepository;
    private final UsuarioRepository usuarioRepository;

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
                    Usuario usuario = new Usuario();
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
    @Transactional
    public PerfilTutor actualizarPerfil(@PathVariable String usuarioId, @RequestBody Map<String, Object> datos) {
        UUID uuid = UUID.fromString(usuarioId);
        PerfilTutor perfil = perfilTutorRepository.findByUsuarioId(uuid)
                .orElseGet(() -> {
                    PerfilTutor nuevo = new PerfilTutor();
                    Usuario usuario = new Usuario();
                    usuario.setId(uuid);
                    nuevo.setUsuario(usuario);
                    return nuevo;
                });

        if (datos.get("especialidad") != null) perfil.setEspecialidad(datos.get("especialidad").toString());
        if (datos.get("tituloAcademico") != null) perfil.setTituloAcademico(datos.get("tituloAcademico").toString());
        if (datos.get("anosExperiencia") != null) perfil.setAnosExperiencia(Integer.parseInt(datos.get("anosExperiencia").toString()));
        if (datos.get("tarifaHora") != null) perfil.setTarifaHora(new java.math.BigDecimal(datos.get("tarifaHora").toString()));

        // biografia y fotoUrl ahora viven en Usuario (compartidos por estudiante y tutor)
        if (datos.get("biografia") != null || datos.get("fotoUrl") != null) {
            usuarioRepository.findById(uuid).ifPresent(usuario -> {
                if (datos.get("biografia") != null) usuario.setBiografia(datos.get("biografia").toString());
                if (datos.get("fotoUrl") != null) usuario.setFotoUrl(datos.get("fotoUrl").toString());
                usuarioRepository.save(usuario);
            });
        }

        return perfilTutorRepository.save(perfil);
    }

    @PutMapping("/disponibilidad/{usuarioId}")
    @Transactional
    @SuppressWarnings("unchecked")
    public PerfilTutor actualizarDisponibilidad(@PathVariable String usuarioId, @RequestBody Map<String, Object> body) {
        PerfilTutor perfil = perfilTutorRepository.findByUsuarioId(UUID.fromString(usuarioId))
                .orElseThrow(() -> new RuntimeException("Perfil de tutor no encontrado"));

        if (perfil.getDisponibilidades() == null) perfil.setDisponibilidades(new ArrayList<>());
        perfil.getDisponibilidades().clear();

        List<Map<String, Object>> items = (List<Map<String, Object>>) body.getOrDefault("disponibilidades", new ArrayList<>());
        for (Map<String, Object> item : items) {
            Disponibilidad d = Disponibilidad.builder()
                    .perfilTutor(perfil)
                    .diaSemana(Disponibilidad.DiaSemana.valueOf(item.get("diaSemana").toString().toUpperCase()))
                    .horaInicio(LocalTime.parse(item.get("horaInicio").toString()))
                    .horaFin(LocalTime.parse(item.get("horaFin").toString()))
                    .build();
            perfil.getDisponibilidades().add(d);
        }

        return perfilTutorRepository.save(perfil);
    }

    @PutMapping("/certificaciones/{usuarioId}")
    @Transactional
    @SuppressWarnings("unchecked")
    public PerfilTutor actualizarCertificaciones(@PathVariable String usuarioId, @RequestBody Map<String, Object> body) {
        PerfilTutor perfil = perfilTutorRepository.findByUsuarioId(UUID.fromString(usuarioId))
                .orElseThrow(() -> new RuntimeException("Perfil de tutor no encontrado"));

        if (perfil.getCertificaciones() == null) perfil.setCertificaciones(new ArrayList<>());
        perfil.getCertificaciones().clear();

        List<Map<String, Object>> items = (List<Map<String, Object>>) body.getOrDefault("certificaciones", new ArrayList<>());
        for (Map<String, Object> item : items) {
            if (item.get("nombre") == null || item.get("nombre").toString().isBlank()) continue;
            Certificacion c = Certificacion.builder()
                    .perfilTutor(perfil)
                    .nombre(item.get("nombre").toString())
                    .institucion(item.get("institucion") != null ? item.get("institucion").toString() : null)
                    .anio(item.get("anio") != null && !item.get("anio").toString().isBlank()
                            ? Integer.parseInt(item.get("anio").toString()) : null)
                    .urlCredencial(item.get("urlCredencial") != null ? item.get("urlCredencial").toString() : null)
                    .build();
            perfil.getCertificaciones().add(c);
        }

        return perfilTutorRepository.save(perfil);
    }
}
