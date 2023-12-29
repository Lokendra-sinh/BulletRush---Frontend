import {
  UserModel,
  VerificationTokenModel,
} from "../../Config/mongooseSchemas.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

async function sendVerificationLink(email, token) {
  try {
    const verificationLink = `http://localhost:5173/verify?token=${token}`;

    const info = await transporter.sendMail({
      from: "anizen242@gmail.com",
      to: email,
      subject: "Verify your email address",
      text: `Click the following link to verify your email address: ${verificationLink}`,
      html: `<p>Click the following link to verify your email address:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`,
    });

    console.log("email sent", info.response);
  } catch (error) {
    console.log("error while sending verification link: ", error);
    throw new Error(error);
  }
}

async function addUserToDatabase(req, res, next) {
  console.log("inside database");
  try {
    const { name, email, password, active } = req.body;
    const hashedPassword = req.hashedPassword;
    const addUser = new UserModel({
      name,
      email,
      active,
      password: hashedPassword,
    });
    const savedUser = await addUser.save();
    const userId = savedUser._id;

    const token = crypto.randomBytes(64).toString("hex");
    const addVerificationToken = new VerificationTokenModel({ userId, token });
    sendVerificationLink(email, token);
    console.log("user idis: ", userId);
    req.userId = userId;
    console.log("data added to mongoDB successfully");
    next();
  } catch (error) {
    console.log("error while adding user to database: ", error);
    next(error);
  }
  console.log("outside database");
}

export { addUserToDatabase };
