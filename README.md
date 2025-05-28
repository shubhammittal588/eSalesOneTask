# e-SalesOne

e-SalesOne is a modern e-commerce web app for browsing, selecting, and purchasing products such as backpacks and shoes.  
It features a Node.js + Express backend with MongoDB Atlas, and a static frontend deployed on Netlify.
---

## 🚀 Live Demo

- **Frontend:** [https://esalesone.netlify.app/](https://esalesone.netlify.app/)
- **Backend API:** [https://esalesonetask.onrender.com](https://esalesonetask.onrender.com)

---

## 🛠️ Features

- Product catalog with images, brands, and prices
- Add to cart and checkout flow
- Dynamic order summary
- Delivery details form
- Order confirmation (Thank You page)
- MongoDB Atlas for secure, scalable data storage
- Fully responsive design

---

## 🏗️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Cloud)
- **Hosting:** Netlify (frontend), Render (backend)

---

## 📦 Folder Structure

- /public
- index.html
- checkout.html
- thankyou.html
- main.js
- checkout.js
- thankyou.js
- /server
- server.js
- Order.js

---

## ⚡️ Quick Start (Local Development)

### 1. Clone the Repo

- git clone [[https://github.com/shubhammittal588/eSalesOneTask/](https://github.com/shubhammittal588/eSalesOneTask.git)]
- cd esalesone


### 2. Install Backend Dependencies

- cd server
- npm install

  
### 3. Set Up MongoDB Atlas

- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
- Create a database user and whitelist your IP
- Copy your connection string

### 4. Create `.env` File in `/server`

- MONGODB_URI=your-mongodb-atlas-connection-string

  
### 5. Run the Backend

- node server.js

Server runs at [http://localhost:3000](http://localhost:3000)

### 6. Open Frontend

Open `/public/index.html` in your browser, or serve with a static server.

---

## 🌍 Deployment

### **Backend (Render):**
- Connect your GitHub repo to [Render](https://render.com/)
- Set the `MONGODB_URI` environment variable in Render dashboard
- Deploy and use the provided backend URL

### **Frontend (Netlify):**
- Connect your GitHub repo to [Netlify](https://netlify.com/)
- Set the publish directory to `/public`
- Deploy and use the provided frontend URL

---

## 🔗 API Endpoints

- `POST /api/order` — Create a new order (item info)
- `PUT /api/order/:id` — Update order with delivery info
- `GET /api/order/:id` — Fetch order details

---
