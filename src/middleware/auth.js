const jwt = require("jsonwebtoken");

const auth =  (req,res,next) => {
    
    const token  = req?.headers?.authorization?.split(' ')[1];
    console.log(token);
    if(!token)
    {
        return res.status(401).json({
            success: false,
            message: "token not found"
        });
    }

    // If token is present then token verification (expire/wrong token)
    try 
    {
        console.log("blah blah")
        const decodeToken = jwt.verify(token,"mysecret2003");
        console.log("decodeToken ",decodeToken)
        req.userId = decodeToken.id;
        next();
        console.log("Token verified");
    }
    catch(err)
    {
        console.log(err)
        return res.status(401).json({
            success: false,
            message: "token is incorrect"
        });
    }
}

module.exports = auth;