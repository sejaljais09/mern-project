# Secure Document Signature Platform

A full-stack MERN application that allows users to upload PDF documents, place signature fields, send signing requests via email, track signing activity, and download signed PDFs securely.

## Features

* User Authentication (JWT)
* PDF Upload & Preview
* Signature Placement on Documents
* Digital Signature Drawing
* Email-based Signing Requests
* Unique Secure Signing Links
* Audit Trail Tracking
* Signature Status Management
* Download Signed PDF
* Cloud Storage Integration
* Responsive Dashboard

## Tech Stack

### Frontend

* React.js
* Vite
* React PDF
* Axios
* Tailwind CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Nodemailer

### Cloud & Deployment

* Cloudinary
* Vercel
* Render

## Project Workflow

1. User uploads a PDF document.
2. Signature fields are placed on the document.
3. Signing links are generated and emailed to signers.
4. Signers open the secure link and provide their signature.
5. Signature status is updated.
6. Audit logs record all signing activities.
7. Signed PDF can be downloaded and stored.

## Installation

### Clone Repository

```bash
git clone <(https://github.com/sejaljais09/mern-project.git)>
cd mern-project
```

### Backend Setup

```bash
cd server
npm install
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

## Environment Variables

### Server (.env)

```env
PORT=5000
MONGO_URI=
JWT_SECRET=
EMAIL_USER=
EMAIL_PASS=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLIENT_URL=
```

### Client (.env)

```env
VITE_API_URL=
```

## Screenshots



### Dashboard

<img width="2234" height="1530" alt="image" src="https://github.com/user-attachments/assets/32d1df66-042b-414e-a732-9a8e2c9bffc1" />


### PDF Preview

<img width="1502" height="1524" alt="image" src="https://github.com/user-attachments/assets/954a4baf-b6ce-441f-bb22-39e809929c50" />


### Audit Trail

<img width="1202" height="530" alt="image" src="https://github.com/user-attachments/assets/15b74293-cad5-422b-b6da-6ec4c63ce21d" />


## Future Enhancements

* Multi-signer workflow
* Expiring signing links
* Email reminders
* Role-based access control
* Advanced analytics dashboard

## Author

Sejal Jaiswal

B.Tech CSE
