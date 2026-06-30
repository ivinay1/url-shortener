// we will start with /signup functions
// user -> name, email,passwd -->
//createUser
//checkmail
// hashPasswd 
//saveuser

const {comparePasswd, hashPasswd} = require('../utils/authUtils');
const User = require('../models/userModel');
const registerUserSchema = require('../validators/auth-validator');
const jwt = require('jsonwebtoken');
const logger = require('../middleware/logging');

async function createUser(req,res){
    
    logger.info("signup api gets hit !!!");

    const {data,error} = registerUserSchema.safeParse(req.body);

    console.log("error",error)
    console.log("data",data)

    if(error)
    {
        console.log("i am called")
        const errors = error.errors.map((errorObj)=>{
             return errorObj.message;
        });

        return res.status(400).json({
            success: false,
            message: errors
        })
    }

    const {name,email,password} = data;

    try
    {
        const emailExists = await User.findOne({email: email});

        if(emailExists)
        {
            logger.warn("email exists for signup ",email);
            return res.status(409).json({
                success: false,
                message: "This email exists please try with another mail"
            });
        }
 
        const hashPassword = await hashPasswd(password);

        await User.create({
            name: name,
            password: hashPassword,
            email: email
            });
    
        logger.info("signup successful user created ",email," ",name);

        res.status(201).json({
            success: true,
            message: "user created successfully"
        });
    
    }
    catch(err)  
    {
        logger.error(err);
        res.status(500).json({
            success: false,
            message: "server error unable to created user"
        })
    }
}

async function checkmail(req,res){

    const email = req.body.email;
    const password = req.body.password;

    logger.info("sign in API gets hit !!! for email ",email," and password ",password);

    console.log(email," ",password);
    try 
    {
        const userExists = await User.findOne({email: email});
        console.log(userExists);
        if(userExists)
        {
            const userPasswd = userExists.password;
            const isValid =  await comparePasswd(password,userPasswd);
            if(!isValid)
            {
                logger.warn("password is wrong for email ",email,"password ",userPasswd);
                return res.status(401).json({
                    success: false,
                    message: "password is wrong"
                });
            }

            //token creation returning
            const token = jwt.sign({id: userExists._id}, "mysecret2003",{
                expiresIn: '1h'
            });

            logger.info("user logged in sucessfully ",email);

            return res.status(200).json({
                success: true,
                message: "login successfull",
                token: token
            });
        }
        
        logger.warn("email is wrong ",email);

        return res.status(400).json({
            success: false,
            message: "email is wrong !!!"
        });

    }
    catch(err)
    {
        logger.error(err);
        res.status(500).json({
            success: false,
            message: "server error"
        });
    }
}

module.exports = {
    checkmail,
    createUser
};