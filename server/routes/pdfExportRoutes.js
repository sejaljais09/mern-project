import express from "express";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const router = express.Router();

router.post("/upload-signed-pdf", async (req, res) => {
  try {
    const { pdfBase64 } = req.body;

    const uploadStream = cloudinary.uploader.upload_stream(
  {
    resource_type: "raw",
    folder: "signed-pdfs",
    chunk_size: 6000000,
    format: "pdf",
  },
  (error, result) => {
    console.log("CLOUDINARY ERROR:", error);
    console.log("CLOUDINARY RESULT:", result);

    if (error) {
      return res.status(500).json(error);
    }

    res.json(result);
  }
);

    streamifier
      .createReadStream(Buffer.from(pdfBase64, "base64"))
      .pipe(uploadStream);

  } catch (err) {
  console.log("PDF EXPORT ERROR:", err);

  res.status(500).json({
    error: err.message,
  });
}
});

export default router;