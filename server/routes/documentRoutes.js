import express from "express";
import Document from "../models/document.js";
import fs from "fs";
import path from "path";
import upload from "../middleware/upload.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

const router = express.Router();

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const result = await uploadToCloudinary(req.file.buffer);

    res.json({
      url: result.secure_url,
    });

  } catch (err) {
    res.status(500).json({
      message: "Upload failed",
      error: err.message,
    });
  }
});


// ✅ MUST MATCH FRONTEND
router.delete("/:id", async (req, res) => {
  try {
    console.log("✅ documentRoutes LOADED");
    console.log("DELETE HIT:", req.params.id);

    const doc = await Document.findById(req.params.id);
    console.log("FOUND DOC:", doc);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    const filePath = path.join(
      process.cwd(),
      "server",
      "uploads",
      doc.filename
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Document.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;