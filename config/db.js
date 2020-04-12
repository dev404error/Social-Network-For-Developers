const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async()=>{
      try {
        await mongoose.connect(db,{
            useNewUrlParser: true,
            useFindAndModify: false,
            useCreateIndex: true,
            useUnifiedTopology: true
        });

        console.log("Database MongoDb connected");
      } catch (error) {
          console.error(error.message);
          // exit process with failure
          process.exit(1);
      }
};

module.exports = connectDB;