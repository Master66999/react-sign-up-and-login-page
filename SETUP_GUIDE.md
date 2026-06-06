# Email Verification System - Setup Guide

## Project Overview
This project implements a complete email verification system for user registration and login using:
- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React + Vite
- **Email**: Nodemailer (Gmail)

## Features Implemented
✅ User registration with email verification
✅ Email verification link (6-hour expiry)
✅ Login with verified email check
✅ Resend verification email
✅ Error handling and validation
✅ Bootstrap UI with responsive design

---

## Backend Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server` folder:

```env
AUTH_EMAIL=your_email@gmail.com
AUTH_PASSWORD=your_app_password
```

**Important: Generate Gmail App Password**
1. Go to myaccount.google.com
2. Navigate to Security (left sidebar)
3. Enable 2-Step Verification (if not already enabled)
4. Go to "App passwords" 
5. Select "Mail" and "Windows Computer"
6. Copy the 16-character password
7. Paste it as `AUTH_PASSWORD` in your `.env` file

### 3. MongoDB Connection
Make sure MongoDB is running on `mongodb://localhost:27017`

If using MongoDB Atlas, replace the connection string in `server/index.js`:
```javascript
mongoose.connect("mongodb+srv://username:password@cluster.mongodb.net/Employee")
```

### 4. Start Server
```bash
npm start
```
Server runs on `http://localhost:5000`

---

## Frontend Setup

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`

---

## API Endpoints

### POST `/signup`
Register a new user
**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "status": "ok",
  "message": "Signup successful! Check your email to verify your account.",
  "user": { ... }
}
```

### GET `/verify/:userid/:uniquestring`
Verify email with token from email link
**Response:**
```json
{
  "status": "ok",
  "message": "Email verified successfully! You can now login."
}
```

### POST `/login`
Login with verified email
**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "status": "ok",
  "message": "Login successful",
  "user": { ... }
}
```

### POST `/resend-verification`
Resend verification email
**Request:**
```json
{
  "email": "john@example.com"
}
```
**Response:**
```json
{
  "status": "ok",
  "message": "Verification email sent! Check your inbox."
}
```

---

## File Structure

```
server/
├── index.js                 # Main server file with all endpoints
├── package.json
├── .env                     # Environment variables (create this)
├── .env.example             # Example env file
└── models/
    ├── employee.js          # User schema
    └── user.js              # Email verification token schema

client/
├── src/
│   ├── App.jsx              # Main app with routes
│   ├── main.jsx             # React entry point
│   ├── signup.jsx           # Registration component
│   ├── login.jsx            # Login component
│   ├── verify.jsx           # Email verification component
│   ├── home.jsx             # Home page (protected)
│   └── assets/              # Static assets
├── package.json
├── vite.config.js
└── index.html
```

---

## User Flow

1. **Sign Up**
   - User enters name, email, password
   - Backend creates user with `verified: false`
   - Verification email sent with unique link
   - User sees success message

2. **Email Verification**
   - User clicks link in email (valid for 6 hours)
   - Frontend calls `/verify` endpoint
   - Backend validates token and marks user as verified
   - User redirected to login

3. **Login**
   - User enters email and password
   - Backend checks if email is verified
   - If verified, login succeeds
   - If not verified, shows error with resend option

---

## Key Models

### Employee (User)
```javascript
{
  name: String,
  email: String (unique),
  password: String,
  verified: Boolean (default: false),
  createdAt: Date
}
```

### User (Verification Token)
```javascript
{
  userid: ObjectId (ref to Employee),
  uniquestring: String,
  createdat: Date,
  expireat: Date (6 hours from creation)
}
```

---

## Troubleshooting

### Issue: "Email transporter error"
**Solution:**
- Check .env file has correct AUTH_EMAIL and AUTH_PASSWORD
- Verify Gmail App Password (not regular password)
- Enable 2-factor authentication on Gmail

### Issue: "MongoDB connection error"
**Solution:**
- Ensure MongoDB is running locally or connection string is correct
- Check MongoDB URI in server/index.js

### Issue: "Verification link not working"
**Solution:**
- Check that verification link URL matches frontend port (default 5173)
- Ensure 6-hour expiry hasn't passed
- Unique string must match exactly

### Issue: "CORS error"
**Solution:**
- Check frontend API calls use correct backend URL: `http://localhost:5000`
- CORS is enabled in server

### Issue: "User already verified but can't login"
**Solution:**
- Check Employee model has `verified: true`
- Ensure password is correct
- Check email is exact match (lowercase)

---

## Security Notes

⚠️ **Important for Production:**
1. Use bcrypt to hash passwords (not plain text)
2. Use JWT tokens for session management
3. Add rate limiting to prevent brute force attacks
4. Use HTTPS instead of HTTP
5. Store sensitive data securely (use .env properly)
6. Add email validation
7. Implement password reset functionality

---

## Next Steps / Enhancements

- [ ] Add password hashing (bcrypt)
- [ ] Add JWT authentication
- [ ] Add password reset functionality
- [ ] Add email validation
- [ ] Add rate limiting
- [ ] Add user profile page
- [ ] Add logout functionality
- [ ] Add OTP verification option
- [ ] Deploy to cloud (Heroku, Railway, etc.)

---

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check server terminal for logs
3. Verify all environment variables are set correctly
4. Ensure MongoDB is running
5. Test API endpoints using Postman
