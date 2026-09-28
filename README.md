Setup Instructions

Follow the steps below to set up and run the project on your local machine.

1. Download the Project

Download the project ZIP file and extract it on your PC.

2. Open the Project

Open the extracted project folder in VS Code.

3. Install Frontend Dependencies

Open the frontend folder in the integrated terminal and run:

npm install

4. Install Backend Dependencies

Open the api folder in the integrated terminal and run:

npm install

5. Configure Environment Variables
Frontend

Create a .env file inside the frontend folder and add:

VITE_API_BASE_URL=your_backend_api_url

Backend

Create a .env file inside the api folder and add:

MONGO_URI=your_mongodb_connection_string
PORT=your_port_number


Note: Replace the placeholder values with your actual configuration.

6. Start the Frontend

Open the integrated terminal inside the frontend folder and run:

npm run dev

7. Start the Backend

Open another integrated terminal inside the api folder and run:

npm run dev

8. Run the Project

Keep both the frontend and backend terminals running while using the project.

Your project is now ready to use. 🚀