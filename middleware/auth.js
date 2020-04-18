const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req,res,next){
    //get token from header
    const token = req.header('x-auth-token');
    //x-auth-token is any name we can assign to the variable for the token in header
   
    if(!token){
        //check if token os present in header or not
        return res.status(401).json({msg : "No token,authorization denied"});
    }

    try {
        //verify if token is correct
        const decoded = jwt.verify(token,config.get('jwtSecret'));
        req.user = decoded.user;
        next();        
    } catch (error) {
        console.log(error);
        return res.status(401).json({msg:"Token is invalid"});
    }

}