# Bug Tracking Application

A Spring Boot REST API application for tracking and managing software bugs throughout their lifecycle. This application provides CRUD operations to create, read, update, and delete bug reports with filtering capabilities.

## Objective

Build a Spring Boot service with CRUD endpoints connected to a PostgreSQL database to provide a structured way to record, categorize, and monitor software issues throughout their resolution lifecycle.

---

## Technologies Used

- **Java 21** - Programming language
- **Spring Boot 3.5.7** - Application framework
- **Spring Data JPA** - Data persistence
- **PostgreSQL** - Relational database
- **Spring Web** - REST API framework
- **Swagger/OpenAPI** - API documentation
- **Gradle** - Build tool

---

## Prerequisites

Before running this application, ensure you have the following installed:

1. **Java 21** or higher
2. **PostgreSQL** (version 12 or higher)
3. **Git** (for version control)
4. **Gradle** (or use the Gradle Wrapper included)

---

## Project Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Bug-Tracking
```

### Step 2: Install Dependencies

The project was created using Spring Initializr with the following dependencies:
- Spring Web
- Spring Data JPA
- PostgreSQL Driver
- Spring Boot Validation
- SpringDoc OpenAPI (Swagger)

All dependencies are configured in `build.gradle`.

### Step 3: Database Setup

1. **Install PostgreSQL** (if not already installed)
   - Download from [PostgreSQL Official Website](https://www.postgresql.org/download/)

2. **Create the Database**
   ```sql
   CREATE DATABASE bugtracker;
   ```

3. **Configure Database Connection**
   - The application will automatically create the `bugs` table on first run
   - Database connection settings are in `application.properties`

### Step 4: Configure Application Properties

Update `src/main/resources/application.properties` with your PostgreSQL credentials:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/bugtracker
spring.datasource.username=your_username
spring.datasource.password=your_password
```

Or use environment variables:
- `DB_URL` - Database connection URL
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `PORT` - Server port (default: 8080)

---

## Project Structure

```
Bug-Tracking/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/
│   │   │       ├── Bug/Tracking/
│   │   │       │   └── BugTrackingApplication.java    # Main application class
│   │   │       └── bugtracker/
│   │   │           ├── config/
│   │   │           │   └── SwaggerConfig.java         # Swagger configuration
│   │   │           ├── controller/
│   │   │           │   └── BugController.java        # REST API endpoints
│   │   │           ├── model/
│   │   │           │   ├── Bug.java                   # Bug entity
│   │   │           │   ├── BugStatus.java             # Status enum
│   │   │           │   └── BugPriority.java          # Priority enum
│   │   │           ├── repository/
│   │   │           │   └── BugRepository.java        # Data access layer
│   │   │           └── service/
│   │   │               ├── BugService.java             # Service interface
│   │   │               └── impl/
│   │   │                   └── BugServiceImpl.java    # Service implementation
│   │   └── resources/
│   │       └── application.properties                 # Application configuration
│   └── test/
│       └── java/
│           └── com/example/Bug/Tracking/
│               └── BugTrackingApplicationTests.java
├── build.gradle                                       # Build configuration
└── README.md                                          # This file
```

---

## Architecture

The application follows a layered architecture:

1. **Controller Layer** (`BugController`)
   - Handles HTTP requests and responses
   - Maps URLs to service methods
   - Returns appropriate HTTP status codes

2. **Service Layer** (`BugService` & `BugServiceImpl`)
   - Contains business logic
   - Manages transactions
   - Handles default values and validations

3. **Repository Layer** (`BugRepository`)
   - Data access layer
   - Extends Spring Data JPA repository
   - Provides custom query methods

4. **Model Layer** (`Bug`, `BugStatus`, `BugPriority`)
   - Entity classes
   - Represents database tables
   - Contains business domain objects

---

## API Endpoints

Base URL: `http://localhost:8080`

### 1. Create Bug
```http
POST /bugs
Content-Type: application/json

{
  "title": "Login button not working",
  "description": "The login button does not respond when clicked",
  "status": "OPEN",
  "priority": "HIGH",
  "assignedTo": "john.doe@example.com"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "title": "Login button not working",
  "description": "The login button does not respond when clicked",
  "status": "OPEN",
  "priority": "HIGH",
  "assignedTo": "john.doe@example.com",
  "createdDate": "2024-01-15T10:30:00",
  "updatedDate": "2024-01-15T10:30:00"
}
```

### 2. Get All Bugs
```http
GET /bugs
```

**Query Parameters (optional):**
- `status` - Filter by status (e.g., `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`)
- `priority` - Filter by priority (e.g., `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)

**Examples:**
```http
GET /bugs?status=OPEN
GET /bugs?priority=HIGH
GET /bugs?status=OPEN&priority=HIGH
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Login button not working",
    "description": "The login button does not respond when clicked",
    "status": "OPEN",
    "priority": "HIGH",
    "assignedTo": "john.doe@example.com",
    "createdDate": "2024-01-15T10:30:00",
    "updatedDate": "2024-01-15T10:30:00"
  }
]
```

### 3. Get Bug by ID
```http
GET /bugs/{id}
```

**Response:** `200 OK` or `404 Not Found`

### 4. Update Bug
```http
PUT /bugs/{id}
Content-Type: application/json

{
  "title": "Updated title",
  "status": "IN_PROGRESS",
  "priority": "MEDIUM"
}
```

**Note:** Partial updates are supported. Only include fields you want to update.

**Response:** `200 OK` or `404 Not Found`

### 5. Delete Bug
```http
DELETE /bugs/{id}
```

**Response:** `204 No Content`

---

## Bug Model

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | Long | Auto-generated | Unique identifier |
| `title` | String | Yes | Bug title (max 200 characters) |
| `description` | String | Yes | Bug description (max 4000 characters) |
| `status` | BugStatus | Yes | Current status (default: OPEN) |
| `priority` | BugPriority | Yes | Priority level (default: MEDIUM) |
| `assignedTo` | String | No | Email/name of assignee (max 100 characters) |
| `createdDate` | LocalDateTime | Auto-generated | Creation timestamp |
| `updatedDate` | LocalDateTime | Auto-generated | Last update timestamp |

### Bug Status Enum

- `OPEN` - Bug is newly created
- `IN_PROGRESS` - Bug is being worked on
- `RESOLVED` - Bug has been fixed
- `CLOSED` - Bug is closed

### Bug Priority Enum

- `LOW` - Low priority issue
- `MEDIUM` - Medium priority (default)
- `HIGH` - High priority issue
- `CRITICAL` - Critical issue requiring immediate attention

---

## Running the Application

### Using Gradle Wrapper

```bash
# Linux/Mac
./gradlew bootRun

# Windows
gradlew.bat bootRun
```

### Build and Run JAR

```bash
# Build
./gradlew build

# Run
java -jar build/libs/Bug-Tracking-0.0.1-SNAPSHOT.jar
```

### Using IDE

1. Import the project into your IDE (IntelliJ IDEA, Eclipse, etc.)
2. Ensure PostgreSQL is running
3. Run `BugTrackingApplication.java` as a Spring Boot application

---

## API Documentation (Swagger)

Once the application is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api-docs

The Swagger UI provides:
- Interactive API testing
- Request/response schemas
- Try-it-out functionality
- Method-based operation sorting

---

## Features

✅ **CRUD Operations** - Full Create, Read, Update, Delete functionality  
✅ **Filtering** - Filter bugs by status and/or priority  
✅ **Default Values** - Automatic default status (OPEN) and priority (MEDIUM)  
✅ **Auto Timestamps** - Automatic creation and update timestamps  
✅ **Partial Updates** - Update only the fields you need  
✅ **API Documentation** - Swagger/OpenAPI integration  
✅ **Transaction Management** - Proper transaction handling  
✅ **Validation** - Input validation support  
✅ **Error Handling** - Proper HTTP status codes and error responses  

---

## Configuration

### Application Properties

Key configuration options in `application.properties`:

```properties
# Server
server.port=8080

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/bugtracker
spring.datasource.username=postgres
spring.datasource.password=postgres

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Swagger
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
```

### Environment Variables

You can override configuration using environment variables:

```bash
export DB_URL=jdbc:postgresql://localhost:5432/bugtracker
export DB_USERNAME=postgres
export DB_PASSWORD=your_password
export PORT=8080
```

---

## Testing the API

### Using cURL

```bash
# Create a bug
curl -X POST http://localhost:8080/bugs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Bug",
    "description": "This is a test bug",
    "priority": "HIGH"
  }'

# Get all bugs
curl http://localhost:8080/bugs

# Get bug by ID
curl http://localhost:8080/bugs/1

# Update bug
curl -X PUT http://localhost:8080/bugs/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS"
  }'

# Delete bug
curl -X DELETE http://localhost:8080/bugs/1
```

### Using Swagger UI

1. Navigate to http://localhost:8080/swagger-ui.html
2. Expand the Bug Controller section
3. Click "Try it out" on any endpoint
4. Fill in the required parameters
5. Click "Execute"

---

## Development Notes

### Transaction Management

- Service layer uses `@Transactional` for write operations
- Read operations use `@Transactional(readOnly = true)` for performance

### Entity Lifecycle

- `@PrePersist` - Sets default values and timestamps on creation
- `@PreUpdate` - Updates timestamp on modification

### Default Values

- Status defaults to `OPEN` if not provided
- Priority defaults to `MEDIUM` if not provided
- Timestamps are automatically managed

---

## Future Enhancements

Potential improvements for future versions:

- [ ] User authentication and authorization
- [ ] Bug assignment to users
- [ ] Comment system for bugs
- [ ] File attachments
- [ ] Email notifications
- [ ] Search functionality
- [ ] Pagination for list endpoints
- [ ] Advanced filtering and sorting
- [ ] Bug history/audit trail
- [ ] Dashboard and analytics

---

## License

This project is part of a learning exercise and demonstration of Spring Boot capabilities.

---

## Contact

For questions or issues, please open an issue in the repository.

