const express = require('express');
const connectDB = require('./config/db');
const authRoute = require('./routes/api/auth');
const usersRoute = require('./routes/api/users');
const profileRoute = require('./routes/api/profile');
const postsRoute = require('./routes/api/posts');

// config module is installed and used to crete these json files which can be accessed from anywhere in the project

const app = express();


//connecting to databse
connectDB();

//as bodyparser s included in express so we use express to parse req.body 
// if we did'nt installed express then we must use bodyparser
app.use(express.json({extended : false}));

//giivng port a value  if it is run on heroku then process.env.PORT automatically gets the port value else port 5000 is assigned to it in loalhost environment
const PORT = process.env.PORT || 5000;

app.get('/',(req,res)=>{
    res.send("API is Running");
})

app.use('/api/auth',authRoute);
app.use('/api/profile',profileRoute);
app.use('/api/users',usersRoute);
app.use('/api/posts',postsRoute);


app.listen(PORT,()=> console.log(`Server is Running on PORT ${PORT}`));