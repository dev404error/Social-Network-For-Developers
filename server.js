const express = require('express');
const connectDB = require('./config/db');
// config module is installed and used to crete these json files which can be accessed from anywhere in the project

const app = express();

//connecting to databse
connectDB();

//giivng port a value  if it is run on heroku then process.env.PORT automatically gets the port value else port 5000 is assigned to it in loalhost environment
const PORT = process.env.PORT || 5000;

app.get('/',(req,res)=>{
    res.send("API is Running");
})

app.listen(PORT,()=> console.log(`Server is Running on PORT ${PORT}`));