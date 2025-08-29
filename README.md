# Game Library
This is a simple web application for managing a video game library. 
It's built with Express.js for the backend and uses a PostgreSQL database for data storage. 
The application allows users to browse and manage a collection of games, genres, and publishers.
## Features 
#### Game Catalog: Browse a visually appealing list of games with images, ratings, and release dates.
#### Detailed Pages: View detailed information for individual games, genres, and publishers.
#### Full CRUD Functionality: Create, Read, Update, and Delete records for games, genres, and publishers.
#### Responsive Design: A clean, mobile-friendly interface powered by Bootstrap.
#### Database Management: A PostgreSQL database with a normalized schema to handle many-to-many relationships between games, genres, and publishers.
#### Form Validation: Robust server-side validation using express-validator to ensure data integrity.


## PrerequisitesBefore running this project, you need to have the following installed:
- Node.js
- PostgreSQL

## Getting Started
Follow these steps to set up and run the project locally:
1. Clone the repository
    ```
    git clone <repository_url>
    cd <repository_name>
    ```
2. Install dependencies
    ```
     npm install
    ```
3. Set up your PostgreSQL database
   Create a new database for this project.
4. Configure your environment variables
   Create a .env file in the root directory of the project and add your database connection string.
   ```
   DB_URL="postgresql://user:password@host:port/database"
   ```
5. Seed the database
   Run the provided script to create the necessary tables and populate them with initial data.
   ```
   node populatedb
   ```
8. Run the application
    Start the Express.js server.
   ```
   npm start
   ```
The application should now be running at http://localhost:3000.

## Technologies Used
- Backend: Node.js, Express.js
- Database: PostgreSQL
- Templating: EJS (Embedded JavaScript)
- Styling: Bootstrap 5
- Validation: express-validator

