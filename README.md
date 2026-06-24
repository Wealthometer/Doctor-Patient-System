# HealthCare+ Doctor-Patient Management System

A production-grade, cloud-native healthcare platform built with Spring Boot microservices, React + TypeScript, PostgreSQL, Docker, Kubernetes, and AWS.

---

## Architecture Overview

```
                         ┌─────────────────────────────────────────┐
                         │           React Frontend (Nginx)         │
                         └──────────────────┬──────────────────────┘
                                            │ HTTPS
                         ┌──────────────────▼──────────────────────┐
                         │         API Gateway  :8080               │
                         │  JWT validation · routing · CORS · logs  │
                         └──┬───┬───┬───┬───┬───┬───┬──────────────┘
                            │   │   │   │   │   │   │
              ┌─────────────┘   │   │   │   │   │   └──────────────────┐
              ▼                 ▼   │   ▼   │   ▼                      ▼
       Auth :8081      Patient:8082 │ Appt:8084 │ Prescription:8085  Billing:8087
              │        Doctor:8083  │           │ Notification:8086
              │                    ▼           ▼
              └──── All services register with Eureka :8761 ────────────┘
                    All services pull config from Config Server :8888
```

## Services & Ports

| Service              | Port  | DB                     |
|----------------------|-------|------------------------|
| Discovery (Eureka)   | 8761  | —                      |
| Config Server        | 8888  | —                      |
| API Gateway          | 8080  | —                      |
| Auth Service         | 8081  | healthcare_auth        |
| Patient Service      | 8082  | healthcare_patients    |
| Doctor Service       | 8083  | healthcare_doctors     |
| Appointment Service  | 8084  | healthcare_appointments|
| Prescription Service | 8085  | healthcare_prescriptions|
| Notification Service | 8086  | healthcare_notifications|
| Billing Service      | 8087  | healthcare_billing     |
| Frontend             | 3000  | —                      |
| Prometheus           | 9090  | —                      |
| Grafana              | 3001  | —                      |

---

## Quick Start — Docker Compose

### Prerequisites
- Docker Desktop 24+
- Docker Compose v2.20+

```bash
# 1. Clone the repo
git clone https://github.com/Wealthometer/doctor-patient-system.git
cd doctor-patient-system

# 2. Start everything
docker-compose up -d

# 3. Wait ~90s for services to start, then check health
docker-compose ps

# 4. Access the app
#   Frontend:  http://localhost:3000
#   Swagger:   http://localhost:8080/swagger-ui.html
#   Eureka:    http://localhost:8761  (eureka / eureka-secret)
#   Grafana:   http://localhost:3001  (admin / admin123)
```

### Default credentials
| Role    | Username | Password   |
|---------|----------|------------|
| Admin   | admin    | Admin@123  |

---

## Local Development (without Docker)

### Prerequisites
- Java 21
- Maven 3.9+
- PostgreSQL 16
- Node.js 20+

### 1 — Start infrastructure
```bash
# Start all 7 PostgreSQL databases
docker-compose up -d postgres-auth postgres-patient postgres-doctor \
  postgres-appointment postgres-prescription postgres-notification postgres-billing
```

### 2 — Start services in order
```bash
# Terminal 1 — Discovery
cd backend/discovery-service && mvn spring-boot:run

# Terminal 2 — Config Server
cd backend/config-server && mvn spring-boot:run

# Terminal 3-9 — Microservices (any order after above)
cd backend/auth-service && mvn spring-boot:run
cd backend/patient-service && mvn spring-boot:run
# ... etc

# Terminal 10 — API Gateway
cd backend/api-gateway && mvn spring-boot:run
```

### 3 — Start the frontend
```bash
cd frontend-react
npm install
npm run dev       # http://localhost:3000
```

---

## Kubernetes Deployment (EKS)

### Prerequisites
- AWS CLI v2
- kubectl
- eksctl

### 1 — Create EKS cluster
```bash
eksctl create cluster \
  --name healthcare-cluster \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 5 \
  --managed
```

### 2 — Create ECR repositories
```bash
for svc in auth-service patient-service doctor-service appointment-service \
           prescription-service notification-service billing-service \
           api-gateway discovery-service config-server frontend; do
  aws ecr create-repository --repository-name $svc --region us-east-1
done
```

### 3 — Build & push images
```bash
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=us-east-1

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build and push each service
for svc in auth-service patient-service doctor-service appointment-service \
           prescription-service notification-service billing-service \
           api-gateway discovery-service config-server; do
  docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$svc:latest backend/$svc
  docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$svc:latest
done
```

### 4 — Deploy to Kubernetes
```bash
# Update image references in deployments.yaml
sed -i "s|\${AWS_ACCOUNT_ID}|$AWS_ACCOUNT_ID|g" kubernetes/deployments/deployments.yaml
sed -i "s|\${AWS_REGION}|$AWS_REGION|g"         kubernetes/deployments/deployments.yaml

# Apply all manifests
kubectl apply -f kubernetes/namespaces/
kubectl apply -f kubernetes/secrets/
kubectl apply -f kubernetes/configmaps/
kubectl apply -f kubernetes/statefulsets/
kubectl apply -f kubernetes/deployments/
kubectl apply -f kubernetes/hpa/
kubectl apply -f kubernetes/ingress/

# Watch pods come up
kubectl get pods -n healthcare-system -w
```

### Useful kubectl commands
```bash
# Check all resources
kubectl get all -n healthcare-system

# View logs
kubectl logs -f deployment/auth-service -n healthcare-system

# Scale a service
kubectl scale deployment/appointment-service --replicas=5 -n healthcare-system

# Rolling update
kubectl set image deployment/auth-service auth-service=new-image:v2 -n healthcare-system
kubectl rollout status deployment/auth-service -n healthcare-system

# Rollback
kubectl rollout undo deployment/auth-service -n healthcare-system

# HPA status
kubectl get hpa -n healthcare-system
```

---

## Environment Variables

| Variable           | Description                        | Default                |
|--------------------|------------------------------------|------------------------|
| `JWT_SECRET`       | Base64 JWT signing key             | (dev default set)      |
| `DB_HOST`          | PostgreSQL hostname                | localhost              |
| `DB_USERNAME`      | DB username                        | postgres               |
| `DB_PASSWORD`      | DB password                        | postgres               |
| `EUREKA_HOST`      | Discovery service host             | localhost              |
| `EUREKA_USERNAME`  | Eureka username                    | eureka                 |
| `EUREKA_PASSWORD`  | Eureka password                    | eureka-secret          |
| `CONFIG_SERVER_URL`| Config server URL                  | http://localhost:8888  |
| `MAIL_HOST`        | SMTP host                          | smtp.gmail.com         |
| `MAIL_USERNAME`    | Email sender                       | —                      |
| `MAIL_PASSWORD`    | Email password / app password      | —                      |

---

## API Documentation

Swagger UI is available at: `http://localhost:8080/swagger-ui.html`

It aggregates all service APIs using the API Gateway.

### Key endpoints

```
POST /api/v1/auth/register          Register a new user
POST /api/v1/auth/login             Login → returns JWT

GET  /api/v1/patients               List all patients (paginated)
POST /api/v1/patients               Create patient profile
GET  /api/v1/patients/{id}          Get patient

GET  /api/v1/doctors                List all doctors
GET  /api/v1/doctors/department/{d} Doctors by department

POST /api/v1/appointments           Book appointment
GET  /api/v1/appointments/doctor/{id}/slots?date=2026-06-10  Available slots

POST /api/v1/prescriptions          Create prescription
GET  /api/v1/prescriptions/patient/{id}/active  Active prescriptions

POST /api/v1/billing/invoices       Create invoice
POST /api/v1/billing/invoices/{id}/payments  Record payment
```

---

## CI/CD Pipeline (GitHub Actions)

The pipeline at `.github/workflows/ci-cd.yml` runs on every push to `main`:

1. **Test** — runs unit tests for all backend services + frontend type check
2. **Build** — multi-stage Docker builds for all 11 images
3. **Push** — images pushed to AWS ECR with SHA tag
4. **Deploy** — `kubectl apply` to EKS cluster with auto-rollback on failure

### Required GitHub Secrets
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
AWS_ACCOUNT_ID
```

---

## Monitoring

- **Prometheus**: `http://localhost:9090` — scrapes `/actuator/prometheus` from all services
- **Grafana**: `http://localhost:3001` — pre-configured Prometheus datasource

Import Grafana dashboard ID **4701** (JVM Micrometer) for instant Spring Boot dashboards.

---

## Project Structure

```
doctor-patient-system/
├── .github/workflows/ci-cd.yml
├── docker-compose.yml
├── docker/
│   ├── prometheus.yml
│   └── grafana/
├── frontend-react/         # React + TypeScript + Tailwind
├── backend/
│   ├── discovery-service/  # Eureka server          :8761
│   ├── config-server/      # Spring Cloud Config    :8888
│   ├── api-gateway/        # Spring Cloud Gateway   :8080
│   ├── auth-service/       # JWT auth               :8081
│   ├── patient-service/    # Patient management     :8082
│   ├── doctor-service/     # Doctor management      :8083
│   ├── appointment-service/# Booking + slots        :8084
│   ├── prescription-service# Rx management          :8085
│   ├── notification-service# Email/SMS              :8086
│   └── billing-service/    # Invoices + payments    :8087
└── kubernetes/
    ├── namespaces/
    ├── secrets/
    ├── configmaps/
    ├── statefulsets/       # PostgreSQL StatefulSets
    ├── deployments/        # All service Deployments
    ├── hpa/                # Horizontal Pod Autoscalers
    └── ingress/
```
