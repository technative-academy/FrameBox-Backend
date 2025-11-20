# Framebox - Backend

A backend **Express** application providing an **API** for **CRUD** operations on users/authentication, playlists (collections), and movies (items). It uses **PostgreSQL** for database management and is hosted on **Railway**. Key NPM packages include **pg**, **slugify**, and **jsonwebtoken**.

---

## 📝 Overview

This project is designed to work alongside a separate **Frontend repository**, which can be found [here](https://github.com/technative-academy/FrameBox-Frontend). It is hosted on **Railway** and utilizes **Cloudinary** for image storage. **API** documentation is available [here](https://framebox-backend-production.up.railway.app/api/docs/).

---

## 🖥️ Features

- Full CRUD operations for Playlists and Movies (collections and items)
- **JWT**-based authentication to restrict access to sensitive CRUD endpoints
- User registration and login
- Playlist management 
- Movie management 
- Image upload and hosting via **Cloudinary** - with moderation logic
- Duplicate entry prevention and data validation
- Custom error handling for common API issues

---

## 🎨 Design

- Modular route structure for scalability (routes)
- Middleware for authentication, validation, and duplicate checks
- Centralized error handling for consistent API responses
- Separation of concerns between services, routes, and database logic

---

## ⚙️ Technologies Used

- **Node.js** - JavaScript runtime environment

- **Express.js** - Web application framework

- **pg** - PostgreSQL client for Node

- **dotenv** - Environment variable management

- **cors** - Cross-origin resource sharing middleware

- **cookie-parser** - Parse cookies in incoming requests

- **yaml** - YAML file parsing for configuration

- **swagger-ui-express** - API documentation UI

### Authentication & Security

- **jsonwebtoken** - JWT-based authentication

- **bcryptjs** - Password hashing

### Media Uploads

- **multer** - Multipart/form-data upload handling

- **cloudinary** - Image hosting, transformation, and delivery

### Utilities

- **slugify** – Generate clean URL slugs

---

## 🤝 Authors

### Backend
- [Matt Hemstock](https://github.com/waker-btn)
- [Tymur Soroka](https://github.com/timtim40a)

### Frontend
- [Nathan Hor](https://github.com/NathanHor22)
- [Thabo Gulu](https://github.com/tgulu)
- [Tymur Soroka](https://github.com/timtim40a)


