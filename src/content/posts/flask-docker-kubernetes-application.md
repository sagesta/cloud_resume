---
title: Flask + Docker + Kubernetes Application
published: 2025-05-02T00:00:00.000Z
description: >
  A production-ready Flask application setup with Docker containerization and
  Kubernetes orchestration.
tags:
  - Project
  - Kubernetes
  - Docker
category: Project
draft: false
---
# Flask + Docker + Kubernetes Application

A production-ready Flask application setup with Docker containerization and Kubernetes orchestration.​

## 📋 Overview

This repository contains everything needed to deploy a scalable Flask web application with a PostgreSQL database using Docker for containerization and Kubernetes for orchestration, suitable for microservices and cloud‑native applications.​

## 🏗️ Project Structure

```text
flask-app/
├── [app.py](http://app.py) # Main Flask application
├── Dockerfile # Docker configuration for Flask app
└── requirements.txt # Python dependencies

K8s/
├── configmap.yaml # ConfigMap for non-sensitive configuration
├── flask-deployment.yaml # Deployment configuration for Flask app
├── ingress.yaml # Ingress for external access
├── postgres.deployment.yaml# Deployment configuration for Postgres
└── secret.yaml # Secret for sensitive configuration
```

## 🔧 Flask Application

The Flask app connects to PostgreSQL and exposes health and database‑check endpoints for Kubernetes probes, with configuration driven by environment variables.​

**Key features**:​

- PostgreSQL integration

- Environment‑variable based configuration

- Health check endpoint for probes

- Database connection test endpoint

## Requirements

`Flask==2.3.3 psycopg2-binary==2.9.9 gunicorn==21.2.0`

## 🐳 Docker Setup

**Build the image**:​

cd flask-app\
docker build -t mypyapp:latest .

**Create Docker network**:​

```
docker network create my-app-network
```

**Run PostgreSQL**:​

```
docker run -d \
 --name postgres-db \
 --network my-app-network \
 -e POSTGRES_USER=myuser \
 -e POSTGRES_PASSWORD=mypassword \
 -e POSTGRES_DB=mydatabase \
 -p 5432:5432 \
 -v postgres_data:/var/lib/postgresql/data \
 postgres:13
```

**Run Flask container**:​

```
docker run -d \
 --name mypyapp \
 --network my-app-network \
 -e POSTGRES_HOST=postgres-db \
 -e POSTGRES_DB=mydatabase \
 -e POSTGRES_USER=myuser \
 -e POSTGRES_PASSWORD=mypassword \
 -p 5000:5000 \
 mypyapp

☸️ Kubernetes Deployment
```

Create namespace:​

```
kubectl create namespace dev-app
```

Apply configs in order:​

```
kubectl apply -f K8s/configmap.yaml
kubectl apply -f K8s/secret.yaml
kubectl apply -f K8s/postgres.deployment.yaml
kubectl apply -f K8s/flask-deployment.yaml
kubectl apply -f K8s/ingress.yaml
```

Verify:​

> ```
> kubectl get pods -n dev-app
> kubectl get services -n dev-app
> kubectl get deployments -n dev-app
> ```

## 🔍 Kubernetes Objects

- **ConfigMap**: non‑sensitive config such as DB host and app environment.​

- **Secret**: DB credentials stored securely.​

- **PostgreSQL Deployment**: persistent volume, env vars from ConfigMap/Secret, internal headless service.​

- **Flask Deployment**: multiple replicas, resource limits, liveness/readiness probes, env from ConfigMap/Secret.​

- **Ingress**: external access with host/path routing via an ingress controller.​

## 🛠️ Troubleshooting

```
View logs: kubectl logs -n dev-app <pod-name>
```

```
Describe pod: kubectl describe pod -n dev-app <pod-name>
```

```
Port‑forward: kubectl port-forward -n dev-app service/flask-service 8080:80​
```

```
Exec into pod: kubectl exec -it -n dev-app <pod-name> -- /bin/bash​
```

## 📊 Scaling

```
kubectl scale -n dev-app deployment/flask-app --replicas=5
```

## 🔄 CI/CD Integration

Typical flow:​

1. Build Docker image in CI.

2. Push image to a container registry.

3. Update Kubernetes deployment with new image tag.

4. Apply any updated manifests.

## 🔒 Security

- DB credentials in Kubernetes Secrets.​

- Optional network policies for traffic control.

- Resource limits to avoid resource exhaustion.

- Probes to ensure only healthy pods receive traffic.​

## 📚 References

- Flask, Docker, Kubernetes, and PostgreSQL official docs are recommended for deeper dives into configuration and best practices.​

1. <https://github.com/sagesta/Deploy-Backend-with-Kubernetes>
