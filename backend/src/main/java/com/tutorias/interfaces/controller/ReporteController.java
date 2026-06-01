package com.tutorias.interfaces.controller;

import com.tutorias.domain.PerfilTutor;
import com.tutorias.repository.PerfilTutorRepository;
import com.tutorias.repository.SesionTutoriaRepository;
import com.tutorias.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Reportes agregados para administración. Protegido por /admin/** (ADMIN, COORDINADOR).
 */
@RestController
@RequestMapping("/admin/reportes")
@RequiredArgsConstructor
@Tag(name = "Admin · Reportes", description = "Métricas agregadas de la plataforma")
public class ReporteController {

    private final SesionTutoriaRepository sesionRepository;
    private final UsuarioRepository usuarioRepository;
    private final PerfilTutorRepository perfilTutorRepository;

    @GetMapping("/resumen")
    @Operation(summary = "Resumen: sesiones por estado, ingresos, ranking de tutores")
    public Map<String, Object> resumen() {
        // Sesiones por estado
        Map<String, Long> sesionesPorEstado = new LinkedHashMap<>();
        long totalSesiones = 0;
        for (Object[] fila : sesionRepository.contarPorEstado()) {
            String estado = String.valueOf(fila[0]);
            long count = ((Number) fila[1]).longValue();
            sesionesPorEstado.put(estado, count);
            totalSesiones += count;
        }

        BigDecimal ingresos = sesionRepository.ingresosCompletadas();

        // Ranking de tutores por sesiones completadas (luego por calificación)
        List<Map<String, Object>> ranking = perfilTutorRepository.findAll().stream()
                .sorted(Comparator
                        .comparing((PerfilTutor t) -> t.getTotalSesiones() == null ? 0 : t.getTotalSesiones())
                        .reversed()
                        .thenComparing(t -> t.getCalificacionPromedio() == null ? BigDecimal.ZERO : t.getCalificacionPromedio(),
                                Comparator.reverseOrder()))
                .limit(5)
                .map(t -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("nombre", t.getUsuario() != null ? t.getUsuario().getNombreCompleto() : "—");
                    m.put("especialidad", t.getEspecialidad());
                    m.put("totalSesiones", t.getTotalSesiones());
                    m.put("calificacionPromedio", t.getCalificacionPromedio());
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> resumen = new LinkedHashMap<>();
        resumen.put("totalUsuarios", usuarioRepository.count());
        resumen.put("totalTutores", perfilTutorRepository.count());
        resumen.put("totalSesiones", totalSesiones);
        resumen.put("ingresosTotales", ingresos);
        resumen.put("sesionesPorEstado", sesionesPorEstado);
        resumen.put("rankingTutores", ranking);
        return resumen;
    }
}
