# Pomodoro Productivity System

A full-stack Pomodoro productivity application with customizable focus sessions, email-based 2FA authentication, and achievement tracking.

Built with Node.js (Fastify), React, PostgreSQL, and Redis, focusing on scalable backend architecture, secure authentication, and performant session management.

---

## Tech Stack

**Backend:** Node.js, Fastify, TypeScript  
**Frontend:** React, TypeScript, Vite  
**Database:** PostgreSQL (Prisma ORM)  
**Cache / Rate Limiting:** Redis  
**Authentication:** JWT (httpOnly cookies), OTP email verification  
**Styling:** Tailwind CSS  
**State Management:** Zustand  
**Infrastructure:** Docker Compose  

---

## Features

- Email-based OTP authentication (2FA for signup and login)
- Custom Pomodoro system with multiple session templates
- Chained focus blocks with auto-restart support
- REST API built with Fastify and modular architecture
- Redis-based OTP storage and rate limiting
- PostgreSQL database with Prisma ORM
- Achievement system tracking completed focus blocks
- Secure authentication using httpOnly JWT cookies
- Client-side timer state with real-time countdown logic

---

## Architecture Overview

- Client manages timer state locally (no server polling during sessions)
- Server handles authentication, authorization, and reward logic
- Redis used for OTP storage and rate limiting
- PostgreSQL stores users, timers, and achievements
- Clear separation between routes, services, and plugins

---

## Authentication Flow

1. User signs up or logs in
2. OTP code is sent to email
3. OTP is verified via API
4. Server issues JWT in httpOnly cookie
5. User accesses protected application routes

---

## Getting Started

```bash
# Install dependencies
npm install

# Start infrastructure (PostgreSQL + Redis)
docker-compose up -d

# Run backend server
npm run dev:server

# Run frontend client
npm run dev:client
