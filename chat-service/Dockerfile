FROM eclipse-temurin:17-jre-jammy

RUN groupadd --system spring && useradd --system --gid spring spring

WORKDIR /app

COPY target/chat-service-0.0.1-SNAPSHOT.jar app.jar

USER spring:spring

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
