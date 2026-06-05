const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const Employeemodels = require('./models/employee')


const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect("mongodb://localhost:27017/Employee");

app.post('/login', async (req, res) => {
    const {email, password} = req.body
    Employeemodels.findOne({email, password})
    .then(user => {
        if(user){
            res.json({status: "ok", user: user})
        }else{
            res.json({status: "error", user: false})
        }
    })
})



app.psot('/signup', async (req, res) => {
    Employeemodels.create(req.body)
    .then(result => res.json(result))
    .catch(err => res.json(err))

})

app.listen(5000, () => {
    console.log("Server is running on port 5000");
})

