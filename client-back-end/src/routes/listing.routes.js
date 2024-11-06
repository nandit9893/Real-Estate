import { Router } from "express";
import { createListing, deleteList, getSearchListings, getSpecificList, updateListing } from "../controllers/listing.controller.js";
import verifyJWT from "../middleware/auth.middleware.js";
import uploadProperty from "../middleware/uploadProperty.middleware.js";

const listingRouter = Router();

listingRouter.route("/create/list").post(verifyJWT, uploadProperty.array("imageURLs", 5), createListing);
listingRouter.route("/delete/list/:deleteID").delete(verifyJWT, deleteList);
listingRouter.route("/update/list/:listID").post(verifyJWT, uploadProperty.array("imageURLs", 5), updateListing);
listingRouter.route("/get/list/:listID").get(getSpecificList);
listingRouter.route("/get/serached/lisitings").get(getSearchListings);

export default listingRouter;
