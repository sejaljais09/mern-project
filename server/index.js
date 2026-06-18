import dotenv from "dotenv";
dotenv.config();
import express from "express";

import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { protect } from "./middleware/authMiddleware.js";
import upload from "./middleware/upload.js";
import path from "path";

import Document from "./models/document.js";
import fileRoutes from "./routes/fileRoutes.js";

import signatureRoutes from "./routes/signatureRoutes.js";
import morgan from "morgan";
import pdfExportRoutes from "./routes/pdfExportRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";


connectDB();


const app = express();

const __dirname = process.cwd();

app.get("/whoami", (req, res) => {
  res.json({
    file: "CURRENT INDEX JS",
    time: new Date(),
  });
});

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(morgan("dev"));
app.use("/api/signatures", signatureRoutes);
app.use("/api/pdf", pdfExportRoutes);
//app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/signature", signatureRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/documents", documentRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Server is running",
    test: "/hello should exist",
    time: new Date(),
  });
});

app.get("/hello", (req, res) => {
  res.json({
    message: "Hello Route Works"
  });
}); 


app.get("/api/users", (req, res) => {
  res.json({ message: "Users route working" });
});

//protected route
app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});




app.post("/upload", upload.single("pdf"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.json({
      message: "PDF uploaded successfully",
      file: req.file,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/docs/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // save in MongoDB
    const doc = await Document.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      url: req.file.url,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    res.json({
      message: "PDF uploaded successfully",
      document: doc,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/api/docs", async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 });

    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.get("/test-file", (req, res) => {
  const filePath = path.resolve("uploads", "1781086687405-306169123.pdf");

  console.log("Testing file path:", filePath);

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  });
});



app.get("/debug", (req, res) => {
  res.json({
    uploadsFolder: path.resolve("uploads"),
  });
});

app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err);
  res.status(500).json({
    message: "Server Error",
    error: err.message,
  });
});




const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

console.log("Static folder:", path.resolve("uploads"));