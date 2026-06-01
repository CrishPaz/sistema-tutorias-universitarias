package com.tutorias.application.service;

import com.tutorias.domain.*;
import com.tutorias.repository.MateriaRepository;
import com.tutorias.repository.PerfilEstudianteRepository;
import com.tutorias.repository.PerfilTutorRepository;
import com.tutorias.repository.SesionTutoriaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

/**
 * Pruebas unitarias de la lógica de reserva (validaciones de #5).
 */
@ExtendWith(MockitoExtension.class)
class SesionServiceTest {

    @Mock SesionTutoriaRepository sesionRepository;
    @Mock PerfilEstudianteRepository estudianteRepository;
    @Mock PerfilTutorRepository tutorRepository;
    @Mock MateriaRepository materiaRepository;

    @InjectMocks SesionService service;

    private final UUID estId = UUID.randomUUID();
    private final UUID tutId = UUID.randomUUID();
    private final UUID matId = UUID.randomUUID();

    private void stubEntidades(PerfilTutor tutor) {
        PerfilEstudiante est = PerfilEstudiante.builder().id(UUID.randomUUID()).build();
        Materia mat = Materia.builder().id(matId).codigo("MAT101").nombre("Cálculo I").build();
        lenient().when(estudianteRepository.findByUsuarioId(estId)).thenReturn(Optional.of(est));
        lenient().when(tutorRepository.findById(tutId)).thenReturn(Optional.of(tutor));
        lenient().when(materiaRepository.findById(matId)).thenReturn(Optional.of(mat));
    }

    private PerfilTutor tutorSinHorario() {
        return PerfilTutor.builder().id(tutId).tarifaHora(new BigDecimal("50.00"))
                .disponibilidades(new ArrayList<>()).build();
    }

    private Disponibilidad.DiaSemana diaDe(LocalDateTime f) {
        return switch (f.getDayOfWeek()) {
            case MONDAY -> Disponibilidad.DiaSemana.LUNES;
            case TUESDAY -> Disponibilidad.DiaSemana.MARTES;
            case WEDNESDAY -> Disponibilidad.DiaSemana.MIERCOLES;
            case THURSDAY -> Disponibilidad.DiaSemana.JUEVES;
            case FRIDAY -> Disponibilidad.DiaSemana.VIERNES;
            case SATURDAY -> Disponibilidad.DiaSemana.SABADO;
            case SUNDAY -> Disponibilidad.DiaSemana.DOMINGO;
        };
    }

    @Test
    void reservarEnElPasado_lanza400() {
        stubEntidades(tutorSinHorario());
        LocalDateTime pasado = LocalDateTime.now().minusDays(1);

        assertThatThrownBy(() ->
                service.reservarSesion(estId, tutId, matId, pasado, 60, "VIRTUAL", null))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("pasado");
    }

    @Test
    void reservarFueraDeDisponibilidad_lanza422() {
        LocalDateTime fecha = LocalDateTime.now().plusDays(7).withHour(3).withMinute(0).withSecond(0).withNano(0);
        // Disponibilidad ese mismo día pero 08:00-10:00 -> las 03:00 quedan fuera
        Disponibilidad disp = Disponibilidad.builder()
                .diaSemana(diaDe(fecha)).horaInicio(LocalTime.of(8, 0)).horaFin(LocalTime.of(10, 0)).build();
        PerfilTutor tutor = PerfilTutor.builder().id(tutId).tarifaHora(new BigDecimal("50.00"))
                .disponibilidades(new ArrayList<>(List.of(disp))).build();
        stubEntidades(tutor);

        assertThatThrownBy(() ->
                service.reservarSesion(estId, tutId, matId, fecha, 60, "VIRTUAL", null))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("disponible");
    }

    @Test
    void reservarConSolapamiento_lanza409() {
        LocalDateTime fecha = LocalDateTime.now().plusDays(7).withHour(9).withMinute(0);
        stubEntidades(tutorSinHorario()); // sin horario -> no se valida disponibilidad
        when(sesionRepository.contarSolapadasTutor(any(), any(), any(), any())).thenReturn(1L);

        assertThatThrownBy(() ->
                service.reservarSesion(estId, tutId, matId, fecha, 60, "VIRTUAL", null))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("horario");
    }

    @Test
    void reservaValida_guardaConEstadoPendienteYPrecio() {
        LocalDateTime fecha = LocalDateTime.now().plusDays(7).withHour(9).withMinute(0);
        stubEntidades(tutorSinHorario());
        when(sesionRepository.contarSolapadasTutor(any(), any(), any(), any())).thenReturn(0L);
        when(sesionRepository.contarSolapadasEstudiante(any(), any(), any(), any())).thenReturn(0L);
        when(sesionRepository.save(any(SesionTutoria.class))).thenAnswer(inv -> inv.getArgument(0));

        SesionTutoria sesion = service.reservarSesion(estId, tutId, matId, fecha, 120, "VIRTUAL", "notas");

        assertThat(sesion.getEstado()).isEqualTo(SesionTutoria.EstadoSesion.PENDIENTE);
        assertThat(sesion.getFechaHoraFin()).isEqualTo(fecha.plusMinutes(120));
        // 120 min = 2h * 50.00 = 100.00
        assertThat(sesion.getPrecio()).isEqualByComparingTo("100.00");
    }
}
