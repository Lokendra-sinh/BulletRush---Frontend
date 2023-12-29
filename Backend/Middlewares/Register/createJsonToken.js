import jwt from 'jsonwebtoken';

async function createJsonToken(req, res, next) {
    console.log("inside token")
    try{
      const userId = req.user;
      const { name, email } = req.body;
    const token = jwt.sign({userId}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.status(200).json({token, name, email});
  
    } catch (error){
      console.log("error while generating token: ", error);
      next(error);
    }
    console.log("outside token")
  }

  export { createJsonToken };