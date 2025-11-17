# Backend Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Project Structure](#project-structure)
5. [Configuration](#configuration)
6. [Running Locally](#running-locally)
7. [Running with Docker](#running-with-docker)
8. [API Endpoints](#api-endpoints)
9. [Data Model](#data-model)
10. [Database Behavior](#database-behavior)
11. [Testing](#testing)
12. [Troubleshooting](#troubleshooting)
13. [Next Steps](#next-steps)

---

## Overview

The backend service is a Spring Boot 3 application that exposes RESTful APIs for managing bugs and employees. It persists data to PostgreSQL, seeds initial employee data on startup, and integrates with the React frontend and AI microservice.

---

## Architecture

- **Framework:** Spring Boot 3
- **Language:** Java 21
- **Build Tool:** Gradle Wrapper
- **Database:** PostgreSQL (via Spring Data JPA)
- **API Documentation:** Swagger UI + OpenAPI
- **Containerization:** Docker image builds available in `backend/Dockerfile`
- **Cross-Origin Support:** Allows requests from the frontend dev host (`http://localhost:5173`)

---

## Prerequisites

Ensure the following are installed locally:

- Java 21 (Temurin or compatible)
- Gradle (not required if using the wrapper)
- PostgreSQL 14+
- Optional: Docker / Docker Compose (for containerized runs)

### Verify Tooling

```bash
java -version
psql --version
```

---

## Project Structure

```
backend/
├── Dockerfile
├── build.gradle
├── gradle/
│   └── wrapper/
├── gradlew
├── gradlew.bat
├── settings.gradle
└── src/
    ├── main/
    │   ├── java/com/example/bugtracker/
    │   │   ├── BugTrackingApplication.java  # Main Spring Boot application
    │   │   ├── config/        # Swagger + Data initializer
    │   │   ├── controller/    # REST controllers
    │   │   ├── model/         # Entities & enums
    │   │   ├── repository/    # Spring Data JPA repositories
    │   │   └── service/       # Service interfaces & implementations
    │   └── resources/
    │       └── application.properties
    └── test/java/com/example/bugtracker/
        └── BugTrackingApplicationTests.java  # Spring Boot test harness
```

---

## Configuration

The backend reads configuration primarily from `src/main/resources/application.properties`, with support for environment overrides. Key properties:

```properties
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/bugtracker}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:postgres}
server.port=${PORT:8080}
spring.jpa.hibernate.ddl-auto=update
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.api-docs.path=/api-docs
```

### Environment Variables

- `DB_URL` – JDBC URL for PostgreSQL.
- `DB_USERNAME` – Database username.
- `DB_PASSWORD` – Database password.
- `PORT` – Server port override (defaults to 8080).

> **Note:** Do not commit `.env` files containing credentials. Use environment variables or secret management in production.

---

## Running Locally

1. **Start PostgreSQL** and ensure the target database exists (`bugtracker` by default).
2. **Export environment overrides** if needed:
   ```bash
   export DB_USERNAME=myuser
   export DB_PASSWORD=securepass
   export DB_URL=jdbc:postgresql://localhost:5432/bugtracker
   ```
3. **Launch the application:**
   ```bash
   cd backend
   ./gradlew bootRun
   ```
4. The API will be available at `http://localhost:8080`.

---

## Running with Docker

The backend runs as a separate Spring Boot container. The AI service runs in its own container.

```bash
# Build the backend image from the repository root
docker build -f backend/Dockerfile -t bug-tracking-backend:v7 .

# Run the backend container
docker run -d --name bug-backend-local -p 8080:8080 \
  -e DB_URL="jdbc:postgresql://host.docker.internal:5432/bugtracker" \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=yourpassword \
  bug-tracking-backend:v7
```

Optional variables:
- `PORT` – override backend port (default: 8080).
- `DB_HOST`, `DB_PORT`, `DB_NAME` – alternative database configuration.

---

## API Endpoints

Swagger UI: `http://localhost:8080/swagger-ui.html`

### Bug Management (`/bugs`)

| Method | Path | Description | Notes |
| --- | --- | --- | --- |
| `POST` | `/api/bugs` | Create a new bug | JSON body with title, description, status, priority, assignedTo, resolution (optional) |
| `GET` | `/api/bugs` | List bugs | Optional query params: `status`, `priority` |
| `GET` | `/api/bugs/{id}` | Retrieve bug by ID | Returns 404 if not found |
| `PUT` | `/api/bugs/{id}` | Update bug | Partial updates supported; missing fields remain unchanged. Can update resolution field. |
| `DELETE` | `/api/bugs/{id}` | Delete bug | Returns `204 No Content` |

### Employee Management (`/employees`)

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/employees` | Fetch all employees (used for assignment dropdowns) |

### Query/Model Notes
- `BugStatus`: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`
- `BugPriority`: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- `assignedTo` must match an existing employee; invalid names are stripped silently.

---

## Data Model

- **Bug** – Core entity stored in the `bugs` table with:
  - Required fields: `title`, `description`, `status`, `priority`
  - Optional fields: `assignedTo`, `resolution` (stored in `resolution_notes` column)
  - Auto-managed: `createdDate`, `updatedDate` (via `@PrePersist` and `@PreUpdate`)
  - Status enum: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`
  - Priority enum: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- **Employee** – Stored in the `employees` table with an `AvailabilityStatus` enum (`AVAILABLE`, `BUSY`).
- **Auto-defaults:** When a bug is created without status/priority, defaults are `OPEN`/`MEDIUM`. `createdDate` and `updatedDate` are managed automatically.
- **Employee Validation:** `EmployeeAssignmentService` ensures that only known employees can be assigned to bugs.
- **Resolution Field:** The `resolution` field (mapped to `resolution_notes` column) stores notes about how a bug was resolved. This is used by the AI service for RAG (Retrieval-Augmented Generation) to learn from past resolutions.

---

## Database Behavior

- Spring Data JPA manages schema updates (`ddl-auto=update`). For production, consider switching to migrations (Flyway/Liquibase).
- `DataInitializer` seeds a default set of employees if the table is empty at startup.
- Repositories provide convenience lookups:
  - `BugRepository` supports filters by status/priority.
  - `EmployeeRepository` offers `findByName`, `findByAvailabilityStatus`, and a custom query for available employees.

---

## Testing

Run the unit/integration test suite with:

```bash
cd backend
./gradlew test
```

Spring Boot’s default test (`BugTrackingApplicationTests`) ensures the application context loads. Add further tests under `src/test/java` as needed.

---

## Troubleshooting

| Issue | Possible Cause | Resolution |
| --- | --- | --- |
| `Cannot connect to database` | PostgreSQL not running or wrong credentials | Verify `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`; ensure DB is reachable from host/container |
| `Table already exists` errors | Switching environments with different schemas | Consider dropping the DB or using migrations instead of `ddl-auto=update` |
| Swagger not reachable | App not running or port conflict | Confirm `./gradlew bootRun` succeeded and port 8080 is free |
| Employee dropdown empty | Seed data not loaded | Check application logs for “Initializing employee data…”; ensure schema allows inserts |

---

## Next Steps

1. Add comprehensive unit and integration tests for services and controllers.
2. Externalize configuration for different environments (dev/staging/prod) via Spring profiles.
3. Introduce database migrations for controlled schema evolution.
4. Implement role-based security if the API will be exposed beyond internal use.
5. Monitor application logs and metrics (Spring Actuator) in production deployments.

---

**Last Updated:** November 2025


