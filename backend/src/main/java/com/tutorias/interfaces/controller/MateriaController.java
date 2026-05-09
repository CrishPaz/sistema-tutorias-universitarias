package com.tutorias.interfaces.controller;

import com.tutorias.domain.Materia;
import com.tutorias.repository.MateriaRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}