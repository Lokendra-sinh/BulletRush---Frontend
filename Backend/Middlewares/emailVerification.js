import { VerificationTokenModel, UserModel } from "../Config/mongooseSchemas.js";

async function emailVerification(req, res, next){
    const extractedToken = req.query.token;
    try{
    const verificationToken = await VerificationTokenModel.findOne({token: extractedToken});
    if(!verificationToken){
        return res.status(404).send('Invalid Verification Token.');
    }

    const user = await UserModel.findById(verificationToken.userId);
    if(!user){
        return res.status(404).send('User not found');
    }

    user.active = true;
    req.user = user;
    await user.save();

    next();
    } catch (error){
        console.log("error while verifying the email address: ", error);
        next(error);
    }
}

export { emailVerification };