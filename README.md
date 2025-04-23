Bulk Ordering Platform
A full-stack MERN application for bulk ordering of fruits and vegetables, featuring user registration, order placement, admin order tracking, and email notifications.
Table of Contents

Overview
The Bulk Ordering Platform allows users to register, place bulk orders for fruits and vegetables, and track their orders. Admins can manage products and monitor all orders. The application includes email notifications for order confirmations and is built with a modular backend and a responsive frontend.
Features

User Authentication: Register and login with email and password (validated with regex).
Order Placement: Users can place bulk orders with multiple items.
Order Tracking: Users view their orders; admins view all orders with status updates.
Email Notifications: Users receive confirmation emails with order details upon placement.
Admin Dashboard: Admins can add/edit/delete products and update order statuses.
Analytics: Admins can view order statistics (total, delivered, pending, failed).
Responsive UI: Built with Tailwind CSS for a modern, mobile-friendly interface.

Technologies

Frontend: React, Vite, React Router, Tailwind CSS, Axios
Backend: Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt
Email: Nodemailer (Gmail SMTP)
Deployment: render (frontend), render (backend)
Others: dotenv, CORS

Setup Instructions
Prerequisites

Node.js (v16 or higher)
MongoDB (local or cloud, e.g., MongoDB Atlas)
Git
Gmail account with App Password for email notifications

Clone the Repository
git clone https://github.com/koushikkumarkadari/fruits.git
cd your-repo

Backend Setup

Navigate to the server directory:
cd server


Install dependencies:
npm install


Create a .env file in server/ based on .env.example:
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password


MongoDB URI: Use MongoDB Atlas or local MongoDB.
JWT_SECRET: A secure random string.
EMAIL_USER/PASS: Gmail address and App Password (generate from Google Account > Security > App Passwords).


Start the backend:
npm start


The server runs on https://fruits-server.onrender.com



Frontend Setup

Navigate to the frontend directory:
cd frontend


Install dependencies:
npm install


Start the frontend:
npm run dev


The app runs on https://fruits-kappa-blush.vercel.app/

Usage

Register: Go to /register, enter a valid email and password (min 6 characters).
Login: Log in at /login to access order placement and tracking.
Place Orders: Use /order to add products (fruits/vegetables) and submit orders.
Track Orders: View your orders at /track-order. Admins can view all orders and update statuses.
Admin Tasks:
Add/edit/delete products via API (e.g., POST /products).
View analytics at /admin/analytics.


Email Notifications: Receive order confirmation emails with details (order ID, items, status).

Contributing

Fork the repository.
Create a feature branch (git checkout -b feature/your-feature).
Commit changes (git commit -m "Add your feature").
Push to the branch (git push origin feature/your-feature).
Open a Pull Request.

License
MIT License. See LICENSE for details.
