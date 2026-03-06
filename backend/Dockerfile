FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY . .

# Maven wrapper permission
RUN chmod +x mvnw

# Build jar
RUN ./mvnw clean package -DskipTests

# Render dynamic port support
ENV PORT=8080
EXPOSE 8080

# Start Spring Boot
CMD java -jar target/*.jar
