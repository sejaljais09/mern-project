import express from "express";

import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { protect } from "./middleware/authMiddleware.js";
import upload from "./middleware/upload.js";
import path from "path";

import Document from "./models/Document.js";
import fileRoutes from "./routes/fileRoutes.js";



dotenv.config();
connectDB();

const app = express();

app.get("/whoami", (req, res) => {
  res.json({
    file: "CURRENT INDEX JS",
    time: new Date(),
  });
});

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRoutes);

app.use("/api/files", fileRoutes);




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


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

console.log("Static folder:", path.resolve("uploads"));