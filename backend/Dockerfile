# Build Spring Boot backend
FROM eclipse-temurin:21-jdk AS backend-build
WORKDIR /app
COPY backend/gradlew ./gradlew
COPY backend/gradle ./gradle
COPY backend/build.gradle ./build.gradle
COPY backend/settings.gradle ./settings.gradle
COPY backend/src ./src
RUN chmod +x gradlew && ./gradlew bootJar --no-daemon

# Runtime image
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=backend-build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

