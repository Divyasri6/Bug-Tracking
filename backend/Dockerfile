# Build Spring Boot backend
FROM eclipse-temurin:21-jdk AS backend-build
WORKDIR /app
COPY backend/gradlew ./
COPY backend/gradle ./gradle
COPY backend/build.gradle ./build.gradle
COPY backend/settings.gradle ./settings.gradle
COPY backend/src ./src
RUN chmod +x gradlew && ./gradlew bootJar --no-daemon

# Final runtime image with Java + Python
FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && \
    apt-get install -y --no-install-recommends openjdk-21-jre-headless bash && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend jar
COPY --from=backend-build /app/build/libs/*.jar /app/backend/app.jar

# Copy AI service source
COPY ai-service /app/ai-service

# Install AI service dependencies
RUN pip install --no-cache-dir -r /app/ai-service/requirements.txt

# Copy startup script
COPY backend/docker/start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 8080 5001

CMD ["/app/start.sh"]

