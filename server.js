const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./src/config/connectDB');
const authRouter = require('./src/routes/authRoutes');
const urlRouter = require('./src/routes/urlRoutes');
const limiter = require('./src/middleware/rateLimiter');
const morgan = require('morgan');
const app = express();

dotenv.config();

app.use(express.json());

app.use(morgan("dev"))

app.use('/auth',limiter,authRouter);

app.use('/',urlRouter);

mongoose.connect(process.env.mongoURI)
        .then(()=>{
             app.listen(process.env.PORT || 0,()=>{
                console.log("Server started successfully")
            });
        })
        .catch((err)=>{
            console.log(err);
        process.exit(1); // fail fast
        })

