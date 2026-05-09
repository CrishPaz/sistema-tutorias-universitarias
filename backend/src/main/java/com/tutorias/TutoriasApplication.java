package com.tutorias;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Sistema Inteligente de Gestión de Tutorías y Asesorías Universitarias
 * 
 * @author Arquitecto Senior - Clean Architecture + Hexagonal
 * @version 1.0.0 Premium
 * @since 2026
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
@EnableAsync
public class TutoriasApplication {

    public static void main(String[] args) {
        SpringApplication.run(TutoriasApplication.class, args);
        System.out.println("""
            =====================================================
            🚀 SISTEMA DE TUTORÍAS UNIVERSITARIAS INICIADO
            =====================================================
            📚 Backend Spring Boot 3.3 + Java 21
            🗄️  PostgreSQL / Supabase Ready
            🔐 JWT + Spring Security Premium
            📖 Swagger UI: http://localhost:8080/swagger-ui.html
            =====================================================
            """);
    }
}