import fs from "fs";
import express from "express";
import upload from "../middleware/upload.js";
import File from "../models/file.js";

const router = express.Router();


// 📤 UPLOAD FILE + SAVE TO DB
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("FILE:", req.file);
console.log("PATH:", req.file.path);
console.log("EXISTS:", fs.existsSync(req.file.path));

    const newFile = await File.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `https://document-signature-api.onrender.com/uploads/${req.file.filename}`,
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
    const files = await File.find();

    console.log("FILES FOUND:", files);

    res.json(files);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// 📤 DELETE A FILE AND ITS UPLOADED ASSET
router.delete("/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    await File.findByIdAndDelete(req.params.id);
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;