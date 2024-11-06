import jwt from "jsonwebtoken";
import APIError from "../utils/APIError.js";
import User from "../models/user.model.js";

const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json(new APIError(401, "Unauthorized request"));
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if (!user) {
            return res.status(401).json(new APIError(401, "Invalid Access Token"));
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json(new APIError(401, error.message || "Invalid access token"));
    }
};

export default verifyJWT;