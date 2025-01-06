|# User Post API

This project is a backend API built with Node.js and SQLite3. The API enables users to create and manage posts. Each post is associated with a user account. Authentication is handled via JSON Web Tokens (JWT).

## Features

- User authentication with JWT.
- Create posts with title, description, and image.
- Secure and efficient data handling.
- SQLite3 database for storing user and post data.

## Database Schema

### CREATE TABLE post(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT, description TEXT, images TEXT, FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE);
 

### CREATE TABLE user(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,name VARCHAR(256) NOT NULL, email TEXT NOT NULL, password TEXT NOT NULL, mobile_number VARCHAR(15) NOT NULL, address TEXT NOT NULL, post_count INTEGER DEFAULT 0);

### Users Table (`user`)
| Column    | Type         | Constraints                 |
|-----------|--------------|-----------------------------|
| id        | INTEGER         | PRIMARY KEY AUTOINCREMENT                 
| name      | TEXT         | NOT NULL                   |
| email     | TEXT         | UNIQUE, NOT NULL           |
| password  | TEXT         | NOT NULL                   |
| address   | TEXT         | NOT NULL                   |
| mobile_number| TEXT      | NOT NULL                   |
| post_count | INTEGER     |  DEFAULT 0                 |
| 
### Posts Table (`post`)
| Column     | Type         | Constraints                 |
|------------|--------------|-----------------------------|
| id         | INTEGER      | PRIMARY KEY AUTOINCREMENT  |
| title      | TEXT         | NOT NULL                   |
| description| TEXT         | NOT NULL                   |
| images     | TEXT         | NOT NULL                   |
| user_id    | INTEGER      | FOREIGN KEY REFERENCES user(id) |

## API Endpoints

### Authentication

#### `POST /user` User sign up
- **Request Body**:
  ```json
{
  "name": "Arun",
  "mobileNumber":"7011430096",
  "email": "arun@gmail.com",
  "password":"Arun@1234",
  "address":"E-1/289 nand nagri delhi = 110093"
}


#### `POST /login`
- **Description**: Authenticates a user and returns a JWT token.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Response**:
  - `200 OK`: Returns the JWT token.
  - `401 Unauthorized`: Invalid email or password.

### Post Management

#### `POST /user/post`
- **Description**: Creates a new post for the authenticated user.
- **Headers**:
  ```json
  {
    "Authorization": "Bearer <jwt_token>"
  }
  ```
- **Request Body**:
  ```json
  {
    "title": "Post Title",
    "description": "Post Description",
    "image": "image_url"
  }
  ```
- **Response**:
  - `201 Created`: Post created successfully.
  - `400 Bad Request`: Missing or invalid fields.
  - `500 Internal Server Error`: Post creation failed.

## Setup

### Prerequisites
- Node.js
- npm or Yarn
- SQLite3

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create the SQLite3 database:
   ```bash
   sqlite3 database.db < schema.sql
   ```
4. Set up the environment variables in a `.env` file:
   ```env
   PORT=3000
   JWT_SECRET=your_secret_key
   DATABASE_PATH=./database.db
   ```
5. Start the server:
   ```bash
   npm start
   ```

## Usage
- Use a tool like Postman to test the endpoints.
- Ensure you include the JWT token in the Authorization header for protected routes.

## Development

### Scripts
- **Start the server**:
  ```bash
  npm start
  ```
- **Run in development mode**:
  ```bash
  npm run dev
  ```

### Code Structure
- **server.js**: Entry point of the application.
- **routes/**: Contains API route handlers.
- **middleware/**: Contains middleware like authentication.
- **database/**: Manages database connections and queries.

## Future Enhancements
- Add API endpoints to edit and delete posts.
- Implement user registration.
- Add unit and integration tests.

## License
This project is licensed under the MIT License.
