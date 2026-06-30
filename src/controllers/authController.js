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

async function createUser(req,res){
    
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
    
        res.status(201).json({
            success: true,
            message: "user created successfully"
        });
    
    }
    catch(err)  
    {
        res.status(500).json({
            success: false,
            message: "server error unable to created user"
        })
    }
}

async function checkmail(req,res){
    
    const email = req.body.email;
    const password = req.body.password;
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
                return res.status(401).json({
                    success: false,
                    message: "password is wrong"
                });
            }

            //token creation returning
            const token = jwt.sign({id: userExists._id}, "mysecret2003",{
                expiresIn: '1h'
            });

            return res.status(200).json({
                success: true,
                message: "login successfull",
                token: token
            });
        }
        
        return res.status(400).json({
            success: false,
            message: "email is wrong !!!"
        });

    }
    catch(err)
    {
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