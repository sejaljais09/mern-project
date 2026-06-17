import express from "express";
import Document from "../models/Document.js";
import fs from "fs";
import path from "path";

const router = express.Router();

// ✅ MUST MATCH FRONTEND
router.delete("/:id", async (req, res) => {
  try {
    console.log("DELETE HIT:", req.params.id);

    const doc = await Document.findById(req.params.id);

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