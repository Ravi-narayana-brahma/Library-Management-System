# 📚 Library Management System

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/SpringBoot-Backend-brightgreen)
![React](https://img.shields.io/badge/React-Frontend-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)

Full Stack **Library Management System** built using **Spring Boot, React, and PostgreSQL**.  
The system manages **books, book copies, students, issuing, reservations, requests, OTP authentication, and fines**.

Repository  
https://github.com/Ravi-narayana-brahma/Library-Management-System

---

# 🚀 Features

- Admin authentication
- Student authentication with OTP
- Book management
- Book copy management
- Issue and return books
- Book reservation system
- Book request system
- Fine calculation for late returns
- Email OTP verification
- Search and filter books

---

# 🛠 Tech Stack

React – Frontend  
Spring Boot – Backend REST API  
PostgreSQL – Database  
Maven – Dependency Management  
JPA / Hibernate – ORM  
Vite – React build tool

---

# 🏗 System Architecture

React Frontend  
↓ REST API  
Spring Boot Backend  
↓  
PostgreSQL Database

---

# 📂 Project Structure

Library-management-System

backend
- config
- controller
- entity
- repository
- service

frontend
- components
- pages
- api

README.md

---

# ⚙️ Installation

Clone repository

git clone https://github.com/Ravi-narayana-brahma/Library-Management-System.git

cd Library-Management-System

---

# 🔧 Backend Setup

cd backend

mvn spring-boot:run

Backend runs on

http://localhost:8080

---

# 💻 Frontend Setup

cd frontend

npm install

npm run dev

Frontend runs on

http://localhost:5173

---

# 🗄 Database Setup (PostgreSQL)

Create database

CREATE DATABASE library_db;

Update application.properties

spring.datasource.url=jdbc:postgresql://localhost:5432/library_db  
spring.datasource.username=postgres  
spring.datasource.password=yourpassword  
spring.jpa.hibernate.ddl-auto=update

---

# 🔌 API Modules

Authentication

POST /auth/login  
POST /auth/register  
POST /auth/verify-otp  

Books

GET /library/books  
POST /library/books  
DELETE /library/books/{id}

Book Copies

POST /library/copies  
PATCH /library/copies/status  

Issue & Return

POST /library/issue  
POST /library/return  

Reservations

POST /library/reserve  
GET /library/reservations  

Requests

POST /library/request  

---

# 📊 Core Modules

Admin Management  
Student Management  
Book Management  
Book Copy Tracking  
Issue / Return System  
Reservation Queue  
Book Requests  
Fine Management  
OTP Email Authentication

---

# 👨‍💻 Author

Ravi Narayana Brahma

GitHub  
https://github.com/Ravi-narayana-brahma

---

⭐ Star the repository if you like the project
