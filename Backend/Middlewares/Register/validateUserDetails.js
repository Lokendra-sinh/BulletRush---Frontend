import { userSchema } from '../../Config/schemas.js'

function validateUserDetails(req, res, next) {
    console.log("inside validation", req.body);
    try {
      const userData = req.body;
      userSchema.parse(userData);
      userData.active = false;
      req.validatedUserData = userData;
      next();
    } catch (error) {
      console.log(error.message);
      next(error.message);
    }
    console.log("ended handleUserInput")
  }

  export { validateUserDetails };