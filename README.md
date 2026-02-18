# 🛒 E-Commerce Fullstack Microservices — Kubernetes Deployment

---

## 📌 Project Overview

This project is a **containerized full-stack e-commerce application** built using a **microservices architecture** and deployed on **Kubernetes**. All services are packaged as Docker images and deployed through Kubernetes manifests stored in the repository.

The platform demonstrates:

* Microservices architecture
* Containerized deployments
* Kubernetes orchestration
* API Gateway routing
* Horizontal scaling
* Namespace isolation
* CI-built Docker images

---

## 🎥 Demo Recording

Recording Link:
[https://drive.google.com/file/d/1seZrSOhb4vk73FS8r4ytkCGTFlh0AtaG/view?usp=drive_link](https://drive.google.com/file/d/1seZrSOhb4vk73FS8r4ytkCGTFlh0AtaG/view?usp=drive_link)

---

## 📦 Repository

GitHub Repository:
[https://github.com/vigneshvv04/ecommerce-fullstack/](https://github.com/vigneshvv04/ecommerce-fullstack/)

Deployment manifests are located under:

```
/k8s
```

---

## 🐳 Docker Images

Docker Hub Repository:
[https://hub.docker.com/repositories/vigneshvijayakumarnagarro](https://hub.docker.com/repositories/vigneshvijayakumarnagarro)

Each microservice image is published via CI pipeline.

---

## 🏗 Architecture Overview

### Layers

| Layer          | Components                                          |
| -------------- | --------------------------------------------------- |
| Frontend       | UI Application                                      |
| Gateway        | API Gateway                                         |
| Backend        | Auth, Cart, Product, Order, Inventory, Notification |
| Infrastructure | Kubernetes Deployments + Services + HPA             |

---

## 📁 Namespace Design

The system uses namespace isolation for logical separation:

| Namespace | Purpose                  |
| --------- | ------------------------ |
| frontend  | UI application resources |
| backend   | API + all microservices  |

**Benefits**

* Resource isolation
* Easier monitoring
* Security boundary
* Organized deployments

---

## 🌐 Frontend Deployment

**Configuration**

* Replicas: 1
* Strategy: Rolling Update
* Port: 80
* Image: `ecommerce-frontend:main`
* Pull Policy: Always

**Resources**

| Type    | CPU  | Memory |
| ------- | ---- | ------ |
| Request | 50m  | 64Mi   |
| Limit   | 200m | 256Mi  |

**Health Checks**

| Probe     | Path | Interval | Timeout |
| --------- | ---- | -------- | ------- |
| Liveness  | `/`  | 10s      | 5s      |
| Readiness | `/`  | 5s       | 3s      |

---

### 🌍 External Access

Frontend is exposed using **NodePort**

| Field    | Value |
| -------- | ----- |
| Port     | 80    |
| NodePort | 31234 |

Access:

```
http://NODE_IP:31234
```

---

### 📈 Autoscaling

Frontend uses Horizontal Pod Autoscaler:

| Setting          | Value |
| ---------------- | ----- |
| Min Pods         | 1     |
| Max Pods         | 3     |
| CPU Threshold    | 70%   |
| Memory Threshold | 80%   |

---

## ⚙ Backend Services

All backend services follow uniform deployment standards:

* Replicas: 1
* Service Type: ClusterIP
* Internal communication only
* Same resource limits
* Always pull latest image

---

### 🔧 Services List

| Service              | Port | Responsibility   |
| -------------------- | ---- | ---------------- |
| API Gateway          | 3000 | Request routing  |
| Auth Service         | 3001 | Authentication   |
| Cart Service         | 3002 | Cart management  |
| Inventory Service    | 3003 | Stock tracking   |
| Notification Service | 3004 | Messaging        |
| Order Service        | 3005 | Order processing |
| Product Service      | 3007 | Product catalog  |

---

### 🔎 Service Discovery

Kubernetes DNS is used internally.

Example:

```
http://auth-service.backend.svc.cluster.local:3001
```

No hardcoded IP addresses are required.

---

## 🔁 Request Flow

```
Client
   ↓
Frontend (NodePort)
   ↓
API Gateway
   ↓
Microservices
```

Communication types:

| Source   | Destination | Type     |
| -------- | ----------- | -------- |
| Frontend | Gateway     | External |
| Gateway  | Services    | Internal |
| Services | Services    | Internal |

---

## 🚀 Deployment Instructions

### 1️⃣ Apply Kubernetes Manifests

```
kubectl apply -f k8s/
```

---

### 2️⃣ Verify Resources

```
kubectl get pods -A
kubectl get svc -A
```

---

### 3️⃣ Access Application

```
http://<NODE_IP>:31234
```

---

## 📊 Scalability Design

The system supports scaling via:

* Horizontal Pod Autoscaler
* Stateless services
* Lightweight containers
* Kubernetes service discovery

---

## 🛡 Reliability Features

* Health probes
* Rolling deployments
* Pod auto-restart
* Service abstraction
* Node failover rescheduling

Failure handling examples:

| Failure         | Recovery                  |
| --------------- | ------------------------- |
| Container crash | Restarted automatically   |
| Pod failure     | Rescheduled               |
| Node failure    | Pod recreated on new node |


---

## 🏁 Conclusion

This project demonstrates a **production-style Kubernetes microservices deployment** for an e-commerce system, featuring modular design, internal service networking, autoscaling, and clean architecture separation.


---

**Author:** Vignesh Vijayakumar
**Project Type:** Fullstack + DevOps + Microservices + Kubernetes

---
