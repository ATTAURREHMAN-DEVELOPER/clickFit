Click Fit – Fitness Website

Click Fit is a simple fitness website built to demonstrate responsive design, basic animations, API usage, and image upload functionality using modern web technologies.

Features

Responsive layout for mobile and desktop

Dark-themed design

Smooth animations and hover effects

AJAX data fetching from a public API

Image upload with preview and validation

Technologies Used
Frontend

HTML

CSS

JavaScript (jQuery)

Bootstrap 5

Backend

Node.js

Express

Multer

CORS

Setup Instructions

Go to the project folder:

cd /home/dev-pc/Work/git/clickFit


Install dependencies:

npm install


Start the server:

npm start


Open in browser:

http://localhost:3000

Project Structure
clickFit/
├── index.html
├── css/style.css
├── js/main.js
├── upload_images/
├── server.js
├── package.json
└── README.md

API Endpoints
POST /upload

Upload image files

Max 10 files

Max size 5MB per file

Image formats only

GET /api/images

Returns uploaded image URLs in JSON format

Notes

Only one page is functional

No database is used

Images are stored locally