import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { initiateSocketLogic } from './Services/socketLogic.js'
import cors from "cors";
import { initiateMongooseConnection } from "./Config/initializeMongoose.js";
import dotenv from "dotenv";
import { validateUserDetails } from "./Middlewares/Register/validateUserDetails.js";
import { hashUserPassword } from "./Middlewares/Register/hashUserPassword.js";
import { addUserToDatabase } from "./Middlewares/Register/addUserToDatabase.js";
import { createJsonToken } from "./Middlewares/Register/createJsonToken.js";
import { emailVerification } from "./Middlewares/emailVerification.js";


const app = express();
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
dotenv.config();

initiateSocketLogic(io);
initiateMongooseConnection();


app.post(
  "/register",
  validateUserDetails,
  hashUserPassword,
  addUserToDatabase,
  (req, res, next) => {
    console.log("inside register route");
  }
);

app.get('/verify', emailVerification, (req, res) => {
console.log("Email verification successful");

})


app.post("/login", )

app.use((err, req, res, next) => {
  console.log("error is: ", err);
  res.status(500).json({ errors: err });
});

app.listen(4000, () => {
  console.log("express server running at 4000");
});

httpServer.listen(3000, () => {
  console.log("http server is running");
});
