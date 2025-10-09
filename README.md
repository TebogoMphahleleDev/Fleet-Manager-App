# 🚗 Fleet Manager App

A full-stack web application designed to manage vehicles, drivers, trips, and maintenance schedules for fleet operations. This project demonstrates strong skills in Angular for the frontend and FastAPI with SQLite for the backend.

## 🎯 Project Objectives
- Master Angular framework and best practices.
- Deepen understanding of FastAPI backend development.
- Learn full-stack architecture and RESTful API design.
- Build efficient and scalable SQLite databases.
- Implement JWT authentication and user authorization.
- Apply real-world business logic in fleet management scenarios.
- Practice end-to-end problem-solving and optimization skills.

## 🧩 Features by Phase

| Phase | Feature | Status | Description |
|-------|---------|--------|-------------|
| Phase 1 | Project Setup | ✅ Completed | Initialized Angular & FastAPI projects with SQLite integration. |
| Phase 2 | Authentication | ✅ Completed | Implemented secure JWT authentication with route protection. |
| Phase 3 | Vehicle Management | ✅ Completed | Added CRUD operations, vehicle forms, and RESTful API integration. |
| Phase 4 | Driver Management | ✅ Completed | Developed driver CRUD, validation, and vehicle assignment. |
| Phase 5 | Trip Management | ✅ Completed | Implemented trip scheduling with double-booking prevention for drivers and vehicles. |
| Phase 6 | Maintenance Tracking | ⏳ Planned | Will manage service schedules and maintenance logs. |
| Phase 7 | Dashboard | ⏳ Planned | Will visualize key data with charts and summaries. |
| Phase 8 | Deployment | ⏳ Planned | Will focus on hosting, CI/CD, and performance optimization. |

## 📊 Current Progress
- Completed: 5 / 8 Phases (62.5%)
- In Progress: 0 / 8 Phases (0%)
- Pending: 3 / 8 Phases (37.5%)

## 🛠 Tech Stack

### Frontend (Angular)
- Angular Components & Services
- RxJS Observables
- Reactive Forms
- Routing & Guards

### Backend (Python FastAPI)
- FastAPI for RESTful APIs
- SQLAlchemy ORM
- Pydantic Schemas
- JWT Authentication
- Dependency Injection

### Database
- SQLite
- Relational Models & Joins
- Query Optimization

## 📁 Project Structure

```
fleet-manager/
├── src/app/
│   ├── components/
│   │   ├── auth/         # Login/Logout
│   │   ├── vehicles/     # Vehicle CRUD
│   │   ├── drivers/      # Driver CRUD & Assignments
│   │   ├── trips/        # Trip Management
│   │   ├── maintenance/  # Maintenance Tracking
│   │   └── dashboard/    # Stats & Reports
│   ├── services/         # API integration
│   ├── guards/           # Route protection
│   └── app-routing.module.ts
└── package.json

backend/
├── models/               # SQLAlchemy models
├── schemas/              # Pydantic schemas
├── routes/               # API routes
├── services/             # Business logic
├── auth/                 # JWT authentication
├── requirements.txt
└── main.py
```

## ⚙️ Setup Instructions

### Frontend
```bash
cd fleet-manager
npm install
ng serve
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## 🧠 Key Concepts Covered
- Angular service injection and state management.
- JWT token handling and secure API communication.
- FastAPI routing, dependency injection, and ORM integration.
- Database schema design and relationships with SQLAlchemy.
- Full CRUD lifecycle from frontend to database.
- Cross-Origin Resource Sharing (CORS) setup.
- Environment variable and configuration management.

## 🎯 Current Development Focus
- Completed Trip Management Module
- Next: Maintenance Tracking Module

## 🪄 Upcoming Features
- Maintenance schedule automation.
- Dashboard with analytics and visualizations.
- Application deployment (frontend + backend).

## 💡 Development Philosophy
"Write every line with understanding. Build projects that teach, not just work."

## 📅 Project Timeline
- This Week: Begin Maintenance Tracking.
- Next Week: Complete Maintenance Tracking and start Dashboard.
- Following Weeks: Add deployment modules.
- Final Stage: Performance optimization and testing.

**Status:** Active Development  
**Last Updated:** October 7, 2025  
**Progress:** 5 / 8 Phases Completed (62.5%)
