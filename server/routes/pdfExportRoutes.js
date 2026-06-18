import express from "express";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const router = express.Router();

router.post("/upload-signed-pdf", async (req, res) => {
  try {
    const { pdfBase64 } = req.body;

    if (!pdfBase64) {
      return res.status(400).json({ error: "Missing pdfBase64 in request body" });
    }

    const dataUri = `data:application/pdf;base64,${pdfBase64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      resource_type: "raw",
      folder: "signed-pdfs",
      public_id: `signed-${Date.now()}`,
      overwrite: true,
    });

    console.log("CLOUDINARY RESULT:", result);
    res.json(result);
  } catch (err) {
    console.log("PDF EXPORT ERROR:", err);
    res.status(500).json({
      error: err.message,
    });
  }
});

export default router;