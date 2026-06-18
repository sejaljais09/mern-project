import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
// import path from "path";
// import fs from "fs";

//const uploadPath = path.join(process.cwd(), "server", "uploads");


// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath, { recursive: true });
// }

// storage setup
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//    cb(null, uploadPath);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   },
// });

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "pdfs",
    resource_type: "raw",
  },
});



// file filter (only PDFs allowed)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

// upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 10MB limit
  },
});

export default upload;