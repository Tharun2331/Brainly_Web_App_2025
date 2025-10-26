# Brainly

Brainly is a web application that helps users save and organize their important online content in one place. Users can save YouTube videos and tweets, organize them, and share their curated collection with others.

## Features

- **Content Management**
  - Save YouTube videos with titles and links
  - Save tweets with custom titles
  - View saved content in an organized dashboard
  - Delete unwanted content

- **User Authentication**
  - Secure signup with username and password
  - Protected routes with JWT authentication
  - Password encryption using bcrypt

- **Sharing Capabilities**
  - Generate unique share links for your content collection
  - View other users' shared collections
  - Real-time content updates

- **User Interface**
  - Clean and modern dashboard
  - Responsive design
  - Interactive content cards
  - Toast notifications for actions

## Tech Stack

### Frontend
- React with TypeScript
- React Router for navigation
- Redux
- Tailwind CSS for styling
- Axios for API requests
- React Toastify for notifications

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Zod for input validation
- CORS enabled

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database
- npm or yarn

### Installation

1. Clone the repository
    ```sh
    git clone https://github.com/Tharun2331/Brainly.git
    cd SecondBrain
    ```

2. Install backend dependencies
    ```sh
    cd secondBrain
    npm install
    ```

3. Install frontend dependencies
    ```sh
    cd ../secondBrainFrontend
    npm install
    ```

4. Create a `.env` file in the `secondBrain` directory with the following variables:
    ```env
    MONGODBURI=your_mongodb_connection_string
    USER_JWT_SECRET=your_jwt_secret
    RANDOM_STRING=your_random_string_for_hash_generation
    ```

### Running the Application

1. Start the backend server
    ```sh
    cd secondBrain
    npm run dev
    ```

2. Start the frontend development server
    ```sh
    cd secondBrainFrontend
    npm run dev
    ```

The application should now be running on:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Usage

1. Create an account using the signup page
2. Login with your credentials
3. Add content using the "Add Content" button
4. View your saved content in the dashboard
5. Share your collection using the "Share Brain" button

---
