# FleetSync — Real-Time B2B Logistics Platform

![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Apache Kafka](https://img.shields.io/badge/Streaming-Apache%20Kafka-231F20?style=flat&logo=apachekafka&logoColor=white)
![Docker](https://img.shields.io/badge/DevOps-Docker-2496ED?style=flat&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

**FleetSync** is a high-performance, real-time B2B logistics and fleet management SaaS platform engineered for live GPS telemetry ingestion, streaming anomaly detection, and interactive driver monitoring.

---

## Key Features

* **Real-Time GPS Telemetry:** Continuous vehicle position tracking delivered directly to the frontend via WebSockets.
* **Streaming Anomaly Detection:** Event-driven pipeline filtering bad coordinate data and triggering immediate alerts for overspeeding or route deviations.
* **Interactive Fleet Dashboard:** Dynamic React frontend for real-time map visualization, vehicle diagnostics, and fleet status monitoring.
* **High-Throughput Ingestion:** Distributed stream-processing backend designed to scale across large vehicle fleets.
* **Containerized Architecture:** Fully dockerized services enabling fast setup and consistent environment deployments.

---

## Tech Stack

### Frontend
* **Framework:** React.js / Vite
* **Styling:** CSS Modules / Modern UI Components
* **Real-time Data:** WebSockets API

### Backend & Stream Processing
* **API Framework:** Python / FastAPI
* **Stream Processing:** Apache Kafka, Pathway
* **Communication:** WebSockets, RESTful APIs

### DevOps & Infrastructure
* **Containerization:** Docker & Docker Compose
* **Version Control:** Git & GitHub

---

## System Architecture

```text
  [ Vehicle Telemetry / GPS Data ]
                  │
                  ▼
         [ Apache Kafka ]
                  │
                  ▼
    [ Pathway / FastAPI Backend ] ◄── (Anomaly & Overspeeding Rules)
                  │
             (WebSockets)
                  │
                  ▼
      [ FleetSync React Dashboard ]
