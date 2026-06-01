# =====================================================
# DOCKERFILE - BACKEND SPRING BOOT 3.3 + JAVA 21
# Sistema de Tutorías Universitarias - Premium
# =====================================================

FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Instalar Maven
RUN apk add --no-cache maven

# Copiar archivos de Maven
COPY pom.xml .
COPY src ./src

# Compilar la aplicación
RUN mvn clean package -DskipTests

# =====================================================
# Runtime Image
# =====================================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Usuario no root para seguridad
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copiar JAR compilado
COPY --from=builder /app/target/tutorias-backend-1.0.0.jar app.jar

# Variables de entorno
ENV JAVA_OPTS="-Xmx512m -Xms256m"
ENV SPRING_PROFILES_ACTIVE=docker

EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]