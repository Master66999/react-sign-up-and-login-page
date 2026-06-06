const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const nodemailer = require('nodemailer')
const {v4: uuidv4} = require('uuid')
require('dotenv').config()

const app = express()
app.use(express.json())
app.use(cors())

const Employee = require('./models/employee')
const User = require('./models/user')

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASSWORD,
    }
})

// Verify transporter connection
transporter.verify((error, success) => {
    if(error){
        console.log("Email transporter error:", error);
    }else{
        console.log("Ready for messages");
    }
})

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/Employee")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log("MongoDB connection error:", err))

// Signup endpoint - creates user and sends verification email
app.post('/signup', async (req, res) => {
    try {
        const {name, email, password} = req.body

        // Validate required fields
        if(!name || !email || !password) {
            return res.status(400).json({status: "error", message: "All fields are required"})
        }

        // Check if user already exists
        const existingUser = await Employee.findOne({email})
        if(existingUser) {
            return res.status(400).json({status: "error", message: "Email already registered"})
        }

        // Create new employee
        const newUser = await Employee.create({
            name,
            email,
            password,
            verified: false
        })

        // Generate unique verification string
        const uniqueString = uuidv4() + newUser._id

        // Create verification record
        const verificationRecord = await User.create({
            userid: newUser._id,
            uniquestring: uniqueString,
            createdat: new Date(),
            expireat: new Date(Date.now() + 6 * 60 * 60 * 1000) // Expires in 6 hours
        })

        // Send verification email
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Email Verification",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome, ${name}!</h2>
                    <p>Please verify your email address by clicking the link below:</p>
                    <p><a href="http://localhost:5173/verify/${newUser._id}/${uniqueString}" 
                           style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Verify Email
                    </a></p>
                    <p>This link expires in 6 hours.</p>
                    <p>If you didn't sign up for this account, please ignore this email.</p>
                </div>
            `
        }

        await transporter.sendMail(mailOptions)

        res.json({status: "ok", message: "Signup successful! Check your email to verify your account.", user: newUser})

    } catch (error) {
        console.log("Signup error:", error)
        res.status(500).json({status: "error", message: "Signup failed", error: error.message})
    }
})

// Email verification endpoint
app.get('/verify/:userid/:uniquestring', async (req, res) => {
    try {
        const {userid, uniquestring} = req.params

        const verificationRecord = await User.findOne({userid})

        if(!verificationRecord) {
            return res.status(400).json({status: "error", message: "Verification record not found"})
        }

        // Check if verification link has expired
        if(verificationRecord.expireat < new Date()) {
            await User.deleteOne({userid})
            return res.status(400).json({status: "error", message: "Verification link has expired"})
        }

        // Check if unique string matches
        if(verificationRecord.uniquestring !== uniquestring) {
            return res.status(400).json({status: "error", message: "Invalid verification link"})
        }

        // Mark user as verified
        await Employee.updateOne({_id: userid}, {verified: true})
        await User.deleteOne({userid})

        res.json({status: "ok", message: "Email verified successfully! You can now login."})

    } catch (error) {
        console.log("Verification error:", error)
        res.status(500).json({status: "error", message: "Verification failed", error: error.message})
    }
})

// Login endpoint
app.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body

        if(!email || !password) {
            return res.status(400).json({status: "error", message: "Email and password are required"})
        }

        const user = await Employee.findOne({email, password})

        if(!user) {
            return res.status(401).json({status: "error", message: "Invalid email or password"})
        }

        if(!user.verified) {
            return res.status(403).json({status: "error", message: "Please verify your email first"})
        }

        res.json({status: "ok", message: "Login successful", user: user})

    } catch (error) {
        console.log("Login error:", error)
        res.status(500).json({status: "error", message: "Login failed", error: error.message})
    }
})

// Resend verification email endpoint
app.post('/resend-verification', async (req, res) => {
    try {
        const {email} = req.body

        if(!email) {
            return res.status(400).json({status: "error", message: "Email is required"})
        }

        const user = await Employee.findOne({email})

        if(!user) {
            return res.status(400).json({status: "error", message: "User not found"})
        }

        if(user.verified) {
            return res.status(400).json({status: "error", message: "Email already verified"})
        }

        // Delete old verification record
        await User.deleteOne({userid: user._id})

        // Generate new verification string
        const uniqueString = uuidv4() + user._id

        // Create new verification record
        await User.create({
            userid: user._id,
            uniquestring: uniqueString,
            createdat: new Date(),
            expireat: new Date(Date.now() + 6 * 60 * 60 * 1000)
        })

        // Send new verification email
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Email Verification - Resend",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Email Verification</h2>
                    <p>Click the link below to verify your email:</p>
                    <p><a href="http://localhost:5173/verify/${user._id}/${uniqueString}" 
                           style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Verify Email
                    </a></p>
                    <p>This link expires in 6 hours.</p>
                </div>
            `
        }

        await transporter.sendMail(mailOptions)

        res.json({status: "ok", message: "Verification email sent! Check your inbox."})

    } catch (error) {
        console.log("Resend verification error:", error)
        res.status(500).json({status: "error", message: "Resend failed", error: error.message})
    }
})

app.listen(5000, () => {
    console.log("Server is running on port 5000");
})

