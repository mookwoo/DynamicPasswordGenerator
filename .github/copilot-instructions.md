# Copilot Instructions for DynamicPasswordGenerator

This document provides guidance for AI agents to effectively contribute to the DynamicPasswordGenerator codebase.

## Overall Architecture

The project is a full-stack application with a vanilla JavaScript frontend and a Node.js/Express backend.

-   **Frontend (`index.html`, `script.js`, `styles.css`)**: A single-page application (SPA) without any major frameworks. All client-side logic is managed within the `SecurePassApp` class in `script.js`. The frontend currently operates in a **demo mode**, where user authentication and data persistence are simulated using `localStorage`.

-   **Backend (`server.js`)**: An Express.js server responsible for serving the static frontend files and providing a REST API under the `/api/` path. It includes security middleware like `helmet`, `cors`, and `express-rate-limit`.

-   **Database (`database/`)**: Uses SQLite for data storage. The database schema is defined in `database/init.js` and includes tables for `users`, `saved_passwords`, and `password_history`. The actual database file is `database/securepass.db`.

**Key Architectural Consideration**: The frontend's use of `localStorage` for auth (`demoUser`) and data (`savedPasswords`, `passwordHistory`) is a temporary mock. A primary goal for backend development is to replace this mock functionality with real API calls to the Express server.

## Developer Workflow

To get the application running locally for development:

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Initialize the database**: This is a critical one-time setup step to create the `securepass.db` file and its tables.
    ```bash
    npm run init-db
    ```
3.  **Run the development server**: This starts the Node.js server with `nodemon`, which will automatically restart on file changes.
    ```bash
    npm run dev
    ```
4.  **Access the application**: Open your browser to `http://localhost:3000`.

## Frontend Development

-   **Main Logic File**: All frontend logic resides in `script.js` within the `SecurePassApp` class. When adding or modifying frontend features, you will likely be adding or changing methods within this class.
-   **Password Generation**: The core feature is the mood-and-theme-based password generator. The logic starts in the `generatePassword` method and utilizes helper methods like `getThemedWords` (which calls the external `api.datamuse.com` API) and `getLocalMoodWords` (as a fallback).
-   **DOM Manipulation**: The application directly manipulates the DOM. There is no virtual DOM. Use standard `document.getElementById` and other DOM APIs.
-   **State Management**: Client-side state (like the current theme, password history, and the demo user session) is stored in `localStorage`.

## Backend Development

-   **API Routes**: All API routes should be prefixed with `/api/`. The main server file is `server.js`.
-   **Database Interaction**: The project uses the `sqlite3` package. When implementing new API endpoints that interact with the database, you'll need to import and use the database connection. The schema is defined in `database/init.js`.
-   **Authentication**: The backend is set up with `bcryptjs` and `jsonwebtoken`, but the authentication logic (user registration, login, token generation, and middleware to protect routes) is not yet implemented. A common task would be to build out these authentication endpoints and replace the frontend's mock auth.

### Example Task: Implementing "Save Password" to the Backend

1.  **Create the API Endpoint**: In `server.js`, create a new authenticated endpoint, e.g., `POST /api/passwords`.
2.  **Add Backend Logic**: This endpoint's handler should:
    -   Verify the user's JWT.
    -   Extract password details from the request body.
    -   Encrypt the password.
    -   Insert the data into the `saved_passwords` table in the SQLite database.
3.  **Update Frontend Logic**: In `script.js`, modify the `saveCurrentPassword` method to:
    -   Remove the `localStorage` logic.
    -   Make a `fetch` call to the new `POST /api/passwords` endpoint, sending the password and the user's auth token in the headers.
