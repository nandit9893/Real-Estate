import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
 destination: "./public",
 filename: (req, file, cb) => {
  cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
 },
});

const uploadProperty = multer({
 storage,
 limits: { fileSize: 3 * 1024 * 1024, files: 5 },
 fileFilter: (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (!allowedMimeTypes.includes(file.mimetype)) {
   cb(new Error("Only image files are allowed!"));
  } else {
   cb(null, true);
  }
 },
});

export default uploadProperty;
