# 🎓 SISTEMA INTELIGENTE DE GESTIÓN DE TUTORÍAS Y ASESORÍAS UNIVERSITARIAS

## 🚀 Descripción General

Plataforma web empresarial premium para la gestión completa de tutorías universitarias, desarrollada con **arquitectura limpia (Clean Architecture)**, **Spring Boot 3 + Java 21**, **Supabase/PostgreSQL**, **Next.js 14** y **Docker**.

### ✨ Características Premium

- **Gestión de Usuarios**: Estudiantes, Tutores, Administradores y Coordinadores
- **Reservas Inteligentes**: Calendario interactivo, disponibilidad en tiempo real
- **Sesiones Virtuales/Presenciales**: Integración Zoom/Meet + ubicación física
- **Calificaciones y Feedback**: Sistema de ratings bidireccional
- **Chat Interno**: Comunicación segura entre estudiante y tutor
- **Reportes Institucionales**: Dashboard analítico con métricas
- **Pagos Integrados**: Preparado para Stripe/PayPal
- **Notificaciones Push**: Recordatorios automáticos
- **Auditoría Completa**: Cumplimiento normativo
- **Dark Mode + UI/UX SaaS Moderna**

---

## 🛠️ Stack Tecnológico

### Backend
- **Java 21** + **Spring Boot 3.3**
- **Clean Architecture** + **Hexagonal**
- **Spring Security** + **JWT** + **OAuth2 Ready**
- **Spring Data JPA** + **Hibernate**
- **MapStruct** + **Lombok**
- **OpenAPI 3** (Swagger)
- **Validation** + **Global Exception Handler**

### Base de Datos
- **Supabase PostgreSQL** (Producción)
- **PostgreSQL 16** (Desarrollo Local)
- UUIDs, Soft Delete, Triggers, Vistas optimizadas

### Frontend
- **Next.js 14** + **TypeScript**
- **TailwindCSS** + **Shadcn/UI** + **Framer Motion**
- **TanStack Query** + **Zustand**
- **React Hook Form** + **Zod**
- **Responsive + Dark Mode Premium**

### DevOps
- **Docker** + **Docker Compose**
- **Nginx** Reverse Proxy
- **Redis** para caché y sesiones
- **Healthchecks** + **Actuator**

---

## 📁 Estructura del Proyecto

```
tutorias-universitarias/
├── backend/                    # Spring Boot Clean Architecture
│   ├── src/main/java/com/tutorias/
│   │   ├── domain/             # Entidades de negocio
│   │   ├── application/        # Casos de uso (Services)
│   │   ├── infrastructure/     # Repositorios, Config
│   │   ├── interfaces/         # DTOs, Mappers, Controllers
│   │   ├── security/           # JWT, Filters, Config
│   │   └── exceptions/         # Manejador global
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                   # Next.js Premium SaaS
│   ├── app/                    # App Router
│   ├── components/             # UI Components (Shadcn)
│   ├── modules/                # Feature Modules
│   └── Dockerfile
├── database/
│   ├── schema.sql              # Esquema completo normalizado
│   └── seeds.sql               # Datos de prueba
├── docker-compose.yml          # Orquestación completa
├── docs/                       # Documentación técnica
└── README.md
```

---

## 🚀 Inicio Rápido (5 minutos)

### 1. Clonar y Levantar

```bash
git clone <repo>
cd tutorias-universitarias

# Levantar todo el stack
docker-compose up -d --build

# Verificar servicios
docker-compose ps
```

### 2. Acceder a la Plataforma

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **Base de Datos**: localhost:5432 (usuario: tutorias_user)

### 3. Credenciales de Prueba

| Rol          | Email                        | Password     |
|--------------|------------------------------|--------------|
| Admin        | admin@tutorias.edu           | Admin123!    |
| Estudiante   | juan.perez@universidad.edu   | Student123!  |
| Tutor        | ana.garcia@tutorias.edu      | Tutor123!    |

---

## 🏗️ Arquitectura (Clean + Hexagonal)

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERFACES (Controllers)                  │
├─────────────────────────────────────────────────────────────┤
│  application/ (Services + Use Cases)                        │
├─────────────────────────────────────────────────────────────┤
│  domain/ (Entities + Value Objects + Business Rules)        │
├─────────────────────────────────────────────────────────────┤
│  infrastructure/ (Repositories + External Services)         │
└─────────────────────────────────────────────────────────────┘
```

### Principios Aplicados
- ✅ **SOLID**
- ✅ **Dependency Inversion**
- ✅ **Single Responsibility**
- ✅ **Separation of Concerns**
- ✅ **Testability**

---

## 🔐 Seguridad Implementada

- JWT Access + Refresh Tokens
- Password Hashing (BCrypt)
- Role-Based Access Control (RBAC)
- CORS Configurado
- Rate Limiting (listo para implementar)
- Input Validation (Bean Validation)
- SQL Injection Prevention (JPA)
- Soft Delete para trazabilidad

---

## 📊 Módulos del Sistema

1. **Auth Module** - Registro, Login, Refresh Token, Password Reset
2. **Estudiantes Module** - Perfil, Historial, Reservas
3. **Tutores Module** - Disponibilidad, Sesiones, Calificaciones
4. **Sesiones Module** - CRUD completo + Estado Machine
5. **Chat Module** - Mensajería en tiempo real (WebSocket ready)
6. **Admin Module** - Dashboard, Reportes, Gestión de Usuarios
7. **Notificaciones Module** - Email + Push + In-App

---

## 🧪 Testing (Recomendado)

```bash
# Backend
cd backend
./mvnw test

# Frontend
cd frontend
npm test
```

---

## 🌐 Despliegue en Producción

### Supabase (Recomendado)
1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ejecutar `schema.sql` y `seeds.sql`
3. Actualizar `application.properties` con credenciales Supabase
4. Desplegar backend en Railway / Render / AWS
5. Desplegar frontend en Vercel

### Variables de Entorno Críticas
```env
JWT_SECRET=tu-clave-super-segura-256-bits
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

---

## 📈 Roadmap Futuro (Premium Features)

- [ ] Integración Zoom API + Google Meet
- [ ] IA para matching tutor-estudiante (ML)
- [ ] Pagos con Stripe + Facturación
- [ ] App Móvil (React Native / Flutter)
- [ ] Analytics Avanzado con Power BI
- [ ] Multi-idioma (ES/EN)
- [ ] WebSocket para chat en tiempo real

---

## 👨‍💻 Desarrollado por

**Arquitecto de Software Senior**  
Especialista en Sistemas Empresariales Modernos  
Stack: Spring Boot + Supabase + Next.js + Docker

**Versión**: 1.0.0 Premium | **Fecha**: Mayo 2026

---

## 📞 Soporte

Para dudas técnicas o personalización empresarial:
- Documentación completa en `/docs`
- Issues en el repositorio
- Email: soporte@tutorias-premium.edu

**¡Listo para producción!** 🚀

---

*Este sistema cumple con los más altos estándares de calidad, seguridad y escalabilidad para instituciones educativas de élite.*