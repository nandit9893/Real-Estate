import { Router } from "express";
import { deleteAccount, getUserDataContacts, getUserListing, googleSignInSignOut, profileUpdate, userLogin, userLogout, userRegistration } from "../controllers/user.controller.js";
import verifyJWT from "../middleware/auth.middleware.js";
import uploadProfile from "../middleware/uploadProfile.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(userRegistration);
userRouter.route("/login").post(userLogin);
userRouter.route("/logout").post(verifyJWT, userLogout);
userRouter.route("/delete").delete(verifyJWT, deleteAccount);
userRouter.route("/google").post(googleSignInSignOut);
userRouter.route("/profile-update").post(verifyJWT, uploadProfile.single("avatar"), profileUpdate);
userRouter.route("/get/lists/:userID").get(verifyJWT, getUserListing);
userRouter.route("/get/user/contact/:userID").get(verifyJWT, getUserDataContacts);

export default userRouter;