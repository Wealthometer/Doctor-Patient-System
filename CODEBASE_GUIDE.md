# Doctor-Patient System Codebase Guide

This document explains how the project works from start to finish, with extra detail on the most important parts: the backend, Docker, Grafana, Kubernetes, and GitHub Actions.

---

## 1. What this application is

This repository is a healthcare management platform built with:
- React + TypeScript for the frontend
- Spring Boot microservices for the backend
- PostgreSQL for persistence
- Docker Compose for local development
- Kubernetes for deployment
- Prometheus + Grafana for monitoring
- GitHub Actions for CI/CD

The main idea is simple:
1. Users log in or register.
2. Patients and doctors create profiles.
3. Appointments are booked.
4. Prescriptions and billing can be managed.
5. Everything is routed through a single API gateway.

---

## 2. High-level architecture

The app is split into two main layers:

### Frontend
The frontend is a React app in [frontend-react](frontend-react).
It provides the UI for:
- login and registration
- patient dashboard
- doctor dashboard
- appointment booking
- prescriptions
- admin screens

### Backend
The backend is a collection of Spring Boot microservices in [backend](backend).
Each service focuses on one part of the domain:
- auth service
- patient service
- doctor service
- appointment service
- prescription service
- notification service
- billing service
- gateway
- config server
- discovery service

---

## 3. How the app works end to end

### Step 1: User opens the frontend
The entry point is [frontend-react/src/main.tsx](frontend-react/src/main.tsx).
It mounts the React app to the browser.

### Step 2: React router handles navigation
The main navigation is defined in [frontend-react/src/App.tsx](frontend-react/src/App.tsx).
It routes users to:
- public pages like login and register
- protected pages for patients, doctors, and admins

### Step 3: Frontend sends requests to the backend
The frontend uses Axios in [frontend-react/src/api/client.ts](frontend-react/src/api/client.ts).
That file:
- creates a shared API client
- attaches JWT tokens to requests
- handles 401 refresh logic
- shows toast messages when errors happen

### Step 4: API gateway receives the request
All requests are routed through the gateway service.
The gateway is implemented in [backend/api-gateway](backend/api-gateway).
Its job is to:
- receive incoming requests
- validate authentication
- forward the request to the correct microservice

### Step 5: Microservices process the request
Each service has its own controller and business logic.
For example:
- auth service handles login and JWTs
- patient service manages patient records
- appointment service handles booking and scheduling
- prescription service handles prescriptions
- billing service handles invoices and payments

### Step 6: Data is stored in PostgreSQL
Each service uses its own database or logical data domain.
The system is designed to separate concerns so that appointments, patients, and billing are not tightly coupled.

---

## 4. Frontend explanation

### Main entry files
- [frontend-react/src/main.tsx](frontend-react/src/main.tsx)
  - Starts the app
  - Mounts React to the DOM

- [frontend-react/src/App.tsx](frontend-react/src/App.tsx)
  - Defines routes
  - Protects pages based on user role

### State management
The app uses Redux in [frontend-react/src/store/index.ts](frontend-react/src/store/index.ts).
The main auth slice is in [frontend-react/src/store/slices/authSlice.ts](frontend-react/src/store/slices/authSlice.ts).
This slice stores:
- user information
- access token
- refresh token
- login status

### API layer
The API services are grouped in [frontend-react/src/api/services.ts](frontend-react/src/api/services.ts).
That file exposes easy methods like:
- authApi.login
- patientApi.create
- doctorApi.getAll
- appointmentApi.book
- prescriptionApi.create
- billingApi.createInvoice

### Why this matters
The frontend is not directly connected to each database.
Instead, it talks to the backend through REST APIs.
That keeps the UI clean and the system modular.

---

## 5. Backend explanation

### Backend structure
The backend is under [backend](backend).
Each service usually has the same internal pattern:
- controller
- service
- repository
- entity
- DTOs
- exceptions

### Common backend flow
A request usually flows like this:
1. controller receives HTTP request
2. controller calls the service layer
3. service processes business logic
4. repository reads or writes to database
5. response is returned to the client

### Important backend examples

#### Auth service
Files:
- [backend/auth-service/src/main/java/com/healthcare/auth/controller/AuthController.java](backend/auth-service/src/main/java/com/healthcare/auth/controller/AuthController.java)
- [backend/auth-service/src/main/java/com/healthcare/auth/service/AuthService.java](backend/auth-service/src/main/java/com/healthcare/auth/service/AuthService.java)

This service is responsible for:
- register
- login
- token creation
- token refresh
- logout
- password change

It is one of the most important services because it secures the rest of the system.

#### Patient service
File:
- [backend/patient-service/src/main/java/com/healthcare/patient/controller/PatientController.java](backend/patient-service/src/main/java/com/healthcare/patient/controller/PatientController.java)

This service allows the application to:
- create a patient profile
- fetch patient details
- search patients
- update patient information
- deactivate a patient

#### Appointment service
File:
- [backend/appointment-service/src/main/java/com/healthcare/appointment/controller/AppointmentController.java](backend/appointment-service/src/main/java/com/healthcare/appointment/controller/AppointmentController.java)

This service handles the core clinical workflow:
- book appointments
- list appointments
- get available slots
- confirm or cancel appointments
- complete appointments

### Spring Boot annotations you will see often
- @SpringBootApplication: marks the app entry point
- @RestController: defines an API controller
- @RequestMapping: sets a route prefix
- @GetMapping / @PostMapping / @PatchMapping: maps HTTP methods
- @Service: marks business logic class
- @Entity: maps a Java class to a database table
- @RequiredArgsConstructor: injects dependencies cleanly
- @Transactional: wraps logic in a database transaction

### Why the backend is split into services
This makes the system:
- easier to scale
- easier to deploy independently
- easier to maintain
- more resilient if one service fails

---

## 6. Docker explanation

### What Docker is doing here
Docker packages each service into a container so it can run consistently anywhere.

### Dockerfiles
Examples:
- [frontend-react/Dockerfile](frontend-react/Dockerfile)
- [backend/auth-service/Dockerfile](backend/auth-service/Dockerfile)

These files define how to build each service:
- install dependencies
- compile the app
- package it into a runtime image
- expose the correct port

### Why Docker is useful
Docker helps with:
- repeatable builds
- environment consistency
- easy deployment to cloud systems
- isolated service runtime

### Local container orchestration
The main local orchestration file is [docker-compose.yml](docker-compose.yml).
It starts the services together with their networking and environment settings.

This file is important because it defines the startup order and service dependencies.

---

## 7. Docker Compose explanation

The compose file in [docker-compose.yml](docker-compose.yml) coordinates the whole stack.
It defines services such as:
- config server
- Eureka discovery
- auth service
- patient service
- doctor service
- appointment service
- prescription service
- billing service
- API gateway

It also sets environment variables and networking so the services can talk to each other.

### Why it matters
Instead of manually starting 10 different apps, you can use one command to bring the system up.

---

## 8. Grafana and Prometheus explanation

### Prometheus
Prometheus is configured in [docker/prometheus.yml](docker/prometheus.yml).
It scrapes metrics from the backend services by calling their actuator endpoints.

This means the system can collect metrics like:
- request count
- latency
- uptime
- service health

### Grafana
Grafana is configured under [docker/grafana](docker/grafana).
The datasource configuration is in [docker/grafana/provisioning/datasources/datasource.yml](docker/grafana/provisioning/datasources/datasource.yml).
That file tells Grafana to connect to Prometheus.

### Why monitoring matters
Monitoring helps you answer questions like:
- Is a service down?
- Is response time growing?
- Is the API under load?
- Are there errors in production?

---

## 9. Kubernetes explanation

The Kubernetes manifests are under [kubernetes](kubernetes).
This is the deployment layer for cloud environments.

### Main files
- [kubernetes/deploy.sh](kubernetes/deploy.sh)
  - deployment helper script
  - creates namespace
  - applies config and secrets
  - deploys PostgreSQL statefulsets
  - deploys the app services
  - applies ingress and autoscaling

- [kubernetes/deployments/deployments.yaml](kubernetes/deployments/deployments.yaml)
  - defines Deployments and Services for the app
  - each service gets a deployment, service, and health checks

- [kubernetes/ingress/ingress.yaml](kubernetes/ingress/ingress.yaml)
  - routes traffic to the correct service
  - exposes the frontend and API gateway externally

- [kubernetes/configmaps/configmaps.yaml](kubernetes/configmaps/configmaps.yaml)
  - stores configuration values for the cluster

### Important Kubernetes concepts in this repo
- Deployment: runs and manages app replicas
- Service: exposes a deployment internally inside the cluster
- Ingress: exposes the app to the outside world
- ConfigMap: stores non-secret configuration
- Secret: stores sensitive values like passwords
- StatefulSet: used for PostgreSQL databases

### Why Kubernetes is used here
Kubernetes gives the system:
- scalability
- resilience
- rolling updates
- self-healing behavior
- cloud deployment support

---

## 10. GitHub Actions CI/CD explanation

The workflow is in [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml).

### What it does
It automatically:
1. checks out the code
2. runs backend tests
3. runs frontend tests, linting, and type checks
4. builds Docker images
5. pushes images to AWS ECR
6. deploys to Kubernetes on the main branch

### Why this is important
This gives you continuous integration and deployment.
Every change can be tested and shipped automatically.

### Main jobs in the workflow
- test-backend
- test-frontend
- build-and-push
- build-and-push-frontend
- deploy

This is a modern DevOps pattern that keeps the project production-ready.

---

## 11. Key code syntax patterns to understand

### Java / Spring Boot syntax
- `@RestController` → HTTP API class
- `@RequestMapping` → route prefix
- `@GetMapping` / `@PostMapping` → specific route methods
- `@Service` → business logic class
- `@Entity` → database model
- `@RequiredArgsConstructor` → dependency injection
- `@Transactional` → database transaction logic

### React / TypeScript syntax
- `function App()` → component definition
- `<Routes>` / `<Route>` → routing
- `useSelector` / `useDispatch` → Redux state access
- `createAsyncThunk` → asynchronous action
- `axios.create(...)` → API client setup

### YAML syntax
Used in:
- Docker Compose
- Kubernetes manifests
- Grafana datasource config
- GitHub Actions workflow

YAML is used because it is simple and declarative for infrastructure and deployment.

---

## 12. Most important files to study first

If you want to understand the project quickly, read these in this order:
1. [README.md](README.md)
2. [docker-compose.yml](docker-compose.yml)
3. [frontend-react/src/App.tsx](frontend-react/src/App.tsx)
4. [frontend-react/src/api/client.ts](frontend-react/src/api/client.ts)
5. [backend/api-gateway/src/main/java/com/healthcare/gateway/filter/JwtAuthenticationFilter.java](backend/api-gateway/src/main/java/com/healthcare/gateway/filter/JwtAuthenticationFilter.java)
6. [backend/auth-service/src/main/java/com/healthcare/auth/controller/AuthController.java](backend/auth-service/src/main/java/com/healthcare/auth/controller/AuthController.java)
7. [backend/appointment-service/src/main/java/com/healthcare/appointment/controller/AppointmentController.java](backend/appointment-service/src/main/java/com/healthcare/appointment/controller/AppointmentController.java)
8. [docker/prometheus.yml](docker/prometheus.yml)
9. [kubernetes/deploy.sh](kubernetes/deploy.sh)
10. [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml)

---

## 13. In one sentence

This project is a role-based healthcare platform where React handles the user interface, Spring Boot microservices handle business logic, Docker and Kubernetes handle deployment, and Prometheus/Grafana monitor the system.
