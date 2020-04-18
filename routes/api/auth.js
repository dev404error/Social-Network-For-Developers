const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const { check,validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

// get
// /api/auth
router.get('/',auth, async (req,res)=>{

 try {
   const user = await User.findById(req.user.id).select('-password');
   res.json(user);
 } catch (error) {
   console.log(error);
   res.status(500).send("Server Error");
 }  
});

//post
// /api/auth
router.post('/',[
  check('email','Enter a valid Email').isEmail(),
  check('password','Password should be of minimum 6 characters.').exists()
],
async (req,res)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors : errors.array()});
  }

  var {  email , password } = req.body; 

  try {
    //check if user email exists or not
    let user = await User.findOne({email});

    if(!user){
      return res.status(500).json({  errors: [ {msg: 'Invalid Credentials'} ]  });
    }
 
    // authenticate user by checking password
    const isMatch = await bcrypt.compare(password , user.password);
    if(!isMatch){
      return res.status(500).json({  errors: [ {msg: 'Invalid Credentials'} ]  });
    }
  
     const payload = {
       user : {
         id : user.id
       }
     };

    //return jsonwebtoken
     jwt.sign(
       payload,
       config.get('jwtSecret'),
       {expiresIn : 360000},
       (err,token)=>{
         if(err)
         throw err;
         res.json({token});
       });

  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
  
});
module.exports = router;
