# Product Price Tracker

A full-stack product price tracking application built with **React**, **Express.js**, **MongoDB**, and **Web Scraping**.

The application allows users to search for products, add them to a tracking list, monitor price changes, and view tracking history through a dashboard.

---

## 🚀 Features

* 🔎 Search and filter products
* 🛍️ View product and store information
* 📌 Add products to a tracking list
* 📊 Track product prices over time
* 🕷️ Retrieve price information using web scraping
* 💾 Store tracking information in MongoDB
* 📈 View current prices and price history
* 📋 Display tracking data in a dashboard

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Web Scraping

### Data Storage

* MongoDB — user/tracking data
* `productCache.json` — cached product information
* `detail.json` — tracking and price information

---

# 📁 Project Structure

```text
product-price-tracker/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── SearchBox.jsx
│   │   │   ├── SearchCard.jsx
│   │   │   └── StorePreview.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── Tracklist.jsx
│   │   │   └── Dashboard.jsx
│   │   │
│   │   └── services/
│   │       └── api.js
│   │
│   └── ...
│
├── api/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── web-scraping/
│   │   ├── productCache.json
│   │   └── detail.json
│   │
│   └── ...
│
└── README.md
```

---

# 📂 Main Components

## Frontend

### `components/`

| File               | Responsibility                                           |
| ------------------ | -------------------------------------------------------- |
| `Navbar.jsx`       | Handles the top navigation                               |
| `Header.jsx`       | Displays the hero section and heading                    |
| `Footer.jsx`       | Displays the website footer                              |
| `SearchBox.jsx`    | Searches and filters products                            |
| `SearchCard.jsx`   | Displays individual product results                      |
| `StorePreview.jsx` | Displays store information and visit-store functionality |

### `pages/`

| File            | Responsibility                           |
| --------------- | ---------------------------------------- |
| `Home.jsx`      | Landing page                             |
| `Search.jsx`    | Product search page                      |
| `Tracklist.jsx` | Displays products added for tracking     |
| `Dashboard.jsx` | Displays tracking and price history data |

### `services/`

| File     | Responsibility                                             |
| -------- | ---------------------------------------------------------- |
| `api.js` | Handles communication between the frontend and backend API |

---

## Backend

| Directory/File      | Responsibility                            |
| ------------------- | ----------------------------------------- |
| `routes/`           | Defines API endpoints                     |
| `controllers/`      | Handles API request/response logic        |
| `web-scraping/`     | Contains product and price scraping logic |
| `productCache.json` | Stores cached product information         |
| `detail.json`       | Stores tracking and price-related data    |

---

# 🔄 Application Flow

```text
                    ┌───────────────┐
                    │   Home Page   │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  Search Page  │
                    └───────┬───────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Search & Filter     │
                 │ productCache.json   │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │   Search Results    │
                 └──────────┬──────────┘
                            │
                   Add to Tracklist
                            │
                            ▼
                 ┌─────────────────────┐
                 │    Tracklist Page   │
                 └──────────┬──────────┘
                            │
                    Start Tracking
                            │
                            ▼
                 ┌─────────────────────┐
                 │    Web Scraping     │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │   Price & Tracking  │
                 │        Data         │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │    Dashboard Page   │
                 └─────────────────────┘
```

---

# 🏗️ Application Architecture

```text
                 ┌─────────────────────┐
                 │      Frontend       │
                 │       React         │
                 └──────────┬──────────┘
                            │
                       API Requests
                            │
                            ▼
                 ┌─────────────────────┐
                 │       Backend       │
                 │      Express.js     │
                 └──────────┬──────────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
                 ▼                     ▼
        ┌─────────────────┐   ┌─────────────────┐
        │     MongoDB     │   │  Web Scraping   │
        │    Database     │   │ Product / Price │
        └─────────────────┘   └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │   Price Data    │
                              └─────────────────┘
```

---

# 📊 Data Flow

### Product Search

```text
productCache.json
       │
       ▼
Search & Filter
       │
       ▼
Search Results
       │
       ▼
Add to Tracklist
       │
       ▼
MongoDB
```

### Price Tracking

```text
Tracked Product
       │
       ▼
Start Tracking
       │
       ▼
Web Scraping
       │
       ▼
Price Data
       │
       ▼
detail.json
       │
       ▼
Dashboard
       │
       ▼
Current Price + Price History
```

---

# ⚙️ Project Setup

Follow the steps below to run the project locally.

## 1. Download the Project

Download the project ZIP file and extract it on your computer.

## 2. Open the Project

Open the extracted project folder in **VS Code**.

## 3. Install Frontend Dependencies

Open a terminal inside the `frontend` folder:

```bash
cd frontend
npm install
```

## 4. Install Backend Dependencies

Open another terminal inside the `api` folder:

```bash
cd api
npm install
```

---

# 🔐 Environment Variables

The project requires environment variables for the frontend and backend.

## Frontend

Create a `.env` file inside the `frontend` folder:

```env
VITE_API_BASE_URL=your_backend_api_url
```

Replace `your_backend_api_url` with the URL of your backend API.

## Backend

Create a `.env` file inside the `api` folder:

```env
MONGO_URI=your_mongodb_connection_string
PORT=your_port_number
```

Replace the placeholder values with your actual MongoDB connection string and desired port.

> **Note:** Do not commit `.env` files or sensitive credentials to GitHub.

---

# ▶️ Running the Project

The frontend and backend need to run simultaneously.

### Terminal 1 — Frontend

```bash
cd frontend
npm run dev
```

### Terminal 2 — Backend

```bash
cd api
npm run dev
```

Keep both terminals running while using the application.

Once both servers are running, open the frontend URL shown in the Vite terminal.

---

# 🧩 Development Journey

The application was developed in the following stages:

1. **Layout & Navigation**

   * Created Header, Navbar, and Footer.

2. **Home Page**

   * Built the landing page and overall application layout.

3. **Search Page**

   * Created the product search interface and supporting components.

4. **Product Search & Filtering**

   * Implemented product filtering using `productCache.json`.

5. **Tracklist**

   * Added functionality to save selected product IDs for tracking.

6. **Price Tracking**

   * Implemented web scraping to retrieve updated product and price information.

7. **Tracking Data**

   * Stored tracking and price-related information in `detail.json`.

8. **Dashboard**

   * Built a dashboard to display tracked products, current prices, and price history.

---

# 🔗 Complete Application Flow

```text
User
 │
 ▼
Home
 │
 ▼
Search Products
 │
 ├── Search / Filter
 │
 ├── View Store
 │
 └── Add to Tracklist
             │
             ▼
        Tracklist
             │
             ▼
       Start Tracking
             │
             ▼
       Web Scraping
             │
             ▼
        Price Data
             │
             ▼
         Dashboard
             │
             ├── Current Price
             └── Price History
```

---

# 📝 Important Notes

* Both frontend and backend servers must be running at the same time.
* Make sure MongoDB is accessible using the connection string configured in `.env`.
* Ensure `VITE_API_BASE_URL` points to the correct backend API.
* Keep sensitive credentials such as MongoDB connection strings outside version control.
* Product search data is sourced from `productCache.json`.
* Tracking and price information is handled through the backend and tracking data files.

---

# 🚀 Project Status

The application is configured as a full-stack **Product Price Tracker** with:

* React frontend
* Express.js backend
* MongoDB database
* Product search and filtering
* Tracklist functionality
* Web scraping
* Price tracking
* Dashboard with price history

**Happy Tracking! 🚀**
