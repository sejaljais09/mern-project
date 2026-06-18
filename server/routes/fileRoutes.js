import fs from "fs";
import express from "express";
import upload from "../middleware/upload.js";
import File from "../models/file.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

const router = express.Router();


// 📤 UPLOAD FILE + SAVE TO DB
router.post("/upload", upload.single("file"), async (req, res) => {
  try {

    console.log("FILE:", req.file); // 👈 yaha

    const result = await uploadToCloudinary(req.file.buffer);

    console.log("CLOUDINARY RESULT:", result); // 👈 aur yaha

    const newFile = await File.create({
      filename: result.public_id,
      originalName: req.file.originalname,
      url: result.secure_url,
      path: result.secure_url,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

    res.json({
      message: "File uploaded successfully",
      file: newFile,
    });

  } catch (error) {
    console.log("UPLOAD ERROR:", error); // 👈 yaha bhi
    res.status(500).json({ error: error.message });
  }
});


// 📥 GET ALL FILES (FOR DASHBOARD)
router.get("/", async (req, res) => {
  try {
    const files = await File.find();

    console.log("FILES FOUND:", JSON.stringify(files,null,2));

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