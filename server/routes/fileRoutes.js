import express from "express";
import upload from "../middleware/upload.js";
import File from "../models/File.js";

const router = express.Router();


// 📤 UPLOAD FILE + SAVE TO DB
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const newFile = await File.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `http://localhost:5000/uploads/${req.file.filename}`,
      path: req.file.path,
      size: req.file.size,
    });

    res.json({
      message: "File uploaded successfully",
      file: newFile,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 📥 GET ALL FILES (FOR DASHBOARD)
router.get("/", async (req, res) => {
  try {
    const files = await File.find().sort({ uploadedAt: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;