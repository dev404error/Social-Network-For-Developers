const express = require('express');
const router = express.Router();
const { check,validationResult } = require('express-validator');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const config = require('config');

// /api/users
router.post('/',[
  check('name','Name is Required').not().isEmpty(),
  check('email','Enter a valid Email').isEmail(),
  check('password','Password should be of minimum 6 characters.').isLength({min:6})
],
async (req,res)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors : errors.array()});
  }

  var { name , email , password } = req.body; 

  try {

    //check if user exists
    let user = await User.findOne({email});

    if(user){
      return res.status(500).json({  errors: [ {msg: 'User already exists'} ]  });
    }
 
    //get users gravatar
    const avatar = gravatar.url(email,{
      s:'200',
      r:'pg',
      d:'mm'
    });


    //encrypt password
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password,salt);

     user = new User({
      name,
      email,
      password,
      avatar
    });
     
    //save in database
     await user.save();


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
