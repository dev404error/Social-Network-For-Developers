const express = require('express');
const router = express.Router();

// /api/profile
router.get('/',(req,res)=>{
  res.send('Profile route');
});

module.exports = router;
