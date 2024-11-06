import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import listingRouter from "./routes/listing.routes.js";
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("/public"));
app.use(cookieParser());

app.use("/real/state/property/users", userRouter);
app.use("/real/state/property/listings", listingRouter);

export default app;
