package com.tutorias.interfaces.controller;

import com.tutorias.domain.Materia;
import com.tutorias.exceptions.ConflictException;
import com.tutorias.exceptions.NotFoundException;
import com.tutorias.repository.MateriaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/materias")
@RequiredArgsConstructor
@Tag(name = "Materias", description = "Gestión de materias")
public class MateriaController {

    private final MateriaRepository materiaRepository;

    @GetMapping
    public List<Materia> obtenerTodas() {
        return materiaRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','COORDINADOR')")
    @Operation(summary = "Crear materia")
    public Materia crear(@RequestBody Materia materia) {
        materia.setId(null);
        if (materia.getCodigo() != null && materiaRepository.existsByCodigo(materia.getCodigo())) {
            throw new ConflictException("Ya existe una materia con el código " + materia.getCodigo());
        }
        return materiaRepository.save(materia);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','COORDINADOR')")
    @Operation(summary = "Actualizar materia")
    public Materia actualizar(@PathVariable UUID id, @RequestBody Materia datos) {
        Materia materia = materiaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Materia no encontrada"));
        if (datos.getCodigo() != null) materia.setCodigo(datos.getCodigo());
        if (datos.getNombre() != null) materia.setNombre(datos.getNombre());
        if (datos.getDescripcion() != null) materia.setDescripcion(datos.getDescripcion());
        if (datos.getCreditos() != null) materia.setCreditos(datos.getCreditos());
        if (datos.getDepartamento() != null) materia.setDepartamento(datos.getDepartamento());
        return materiaRepository.save(materia);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','COORDINADOR')")
    @Operation(summary = "Eliminar materia")
    public void eliminar(@PathVariable UUID id) {
        if (!materiaRepository.existsById(id)) {
            throw new NotFoundException("Materia no encontrada");
        }
        materiaRepository.deleteById(id);
    }
}
