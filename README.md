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

## Setup

Follow the steps below to run the project locally.

### Installation

1. Clone the repository

```bash
git clone https://github.com/technative-academy/FrameBox-Backend.git
cd FrameBox-Backend
```

2. Install dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# --- Server ---
PORT=
# Example: 4000, 8080, etc.

# --- PostgreSQL ---
DATABASE_HOSTNAME=
# Example: localhost, db.example.com

DATABASE_PORT=
# Example: 5432 (default Postgres port)

DATABASE_USER=
# Example: postgres, admin, framebox_user

DATABASE_PW=
# Example: supersecurepassword123

DATABASE_NAME=
# Example: framebox_db, test_db

# --- JWT / Authentication ---
ACCESS_TOKEN_SECRET=
# Example: a_long_random_string_here
# Generate with: `openssl rand -hex 32`

REFRESH_TOKEN_SECRET=
# Example: another_long_random_string_here

ACCESS_EXPIRY_TIME=
# Example: 15m, 1h

REFRESH_EXPIRY_TIME=
# Common example: 7d

# --- Cloudinary ---
CLOUDINARY_CLOUD_NAME=
# Example: mycloud123

CLOUDINARY_API_KEY=
# Example: Cloudinary API key (number)

CLOUDINARY_API_SECRET=
# Example: long-string-secret

# --- CORS ---
CORS_ORIGIN=
# Example: frontend URL in development
```

Make sure to add your own actual credentials.

### Database Setup

Before running the project, you must create the PostgreSQL database and tables it relies on.

```sql
CREATE TABLE movies (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	slug text NOT NULL,
	title text NOT NULL,
	description text NULL,
	date_added timestamptz NOT NULL,
	img text NULL,
	approved bool DEFAULT false NULL,
	img_id text NULL,
	user_id uuid NULL,
	CONSTRAINT movies_pkey PRIMARY KEY (id),
	CONSTRAINT movies_slug_key UNIQUE (slug)
);

CREATE TABLE users (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	slug text NOT NULL,
	username text NOT NULL,
	bio text NULL,
	email text NOT NULL,
	password text NOT NULL,
	date_joined timestamptz NOT NULL,
	CONSTRAINT users_email_key UNIQUE (email),
	CONSTRAINT users_pkey PRIMARY KEY (id),
	CONSTRAINT users_slug_key UNIQUE (slug),
	CONSTRAINT users_username_key UNIQUE (username)
);


CREATE TABLE playlists (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	slug text NOT NULL,
	title text NOT NULL,
	summary text NULL,
	date_created timestamptz NOT NULL,
	user_id uuid NOT NULL,
	img text NULL,
	approved bool DEFAULT false NOT NULL,
	img_id text NULL,
	CONSTRAINT playlists_pkey PRIMARY KEY (id),
	CONSTRAINT playlists_slug_key UNIQUE (slug),
	CONSTRAINT playlists_user_id_fkey1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE playlist_movies (
	playlist_id uuid NOT NULL,
	movie_id uuid NOT NULL,
	CONSTRAINT playlist_movies_pkey PRIMARY KEY (playlist_id, movie_id),
	CONSTRAINT playlist_movies_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
	CONSTRAINT playlist_movies_playlist_id_fkey FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
);
```

### Running the Server

To start the backend locally:

```bash
node server.js
```

The API will be available at:

[http://localhost:3000](http://localhost:3000) (or your custom port number)

### Testing the API

Once running, you can explore the documentation at:

[http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## 🤝 Authors

### Backend
- [Matt Hemstock](https://github.com/waker-btn)
- [Tymur Soroka](https://github.com/timtim40a)

### Frontend
- [Nathan Hor](https://github.com/NathanHor22)
- [Thabo Gulu](https://github.com/tgulu)
- [Tymur Soroka](https://github.com/timtim40a)



