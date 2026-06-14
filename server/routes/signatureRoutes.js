import express from "express";
import Signature from "../models/signature.js";
import { body, validationResult } from "express-validator";


const router = express.Router();

// router.post(
//   "/",
//   [
//     body("documentId").notEmpty(),
//     body("x").isNumeric(),
//     body("y").isNumeric(),
//     body("signer").notEmpty(),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     try {
//       const signature = await Signature.create(req.body);
//       res.status(201).json(signature);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   }
// );
router.post("/", async (req, res) => {
  try {
    const { documentId, x, y, signer, email } = req.body;

    console.log("🔥 CLEAN BODY:", req.body);

    if (!documentId || x == null || y == null || !signer || !email) {
      return res.status(400).json({
        message: "Missing required fields",
        body: req.body,
      });
    }

    const signature = await Signature.create({
      documentId,
      x,
      y,
      signer,
      email,
    });

    res.status(201).json(signature);
  } catch (error) {
    console.log("❌ ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});
router.get("/:documentId", async (req, res) => {
  try {
    const signatures = await Signature.find({
      documentId: req.params.documentId,
    });

    res.json(signatures);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});




router.put("/:id/sign", async (req, res) => {
  try {
    console.log("PUT HIT");
    console.log("ID:", req.params.id);
    console.log("BODY:", req.body);

    const { signatureImage } = req.body;

    const updated = await Signature.findByIdAndUpdate(
      req.params.id,
      {
        signatureImage,
        status: "signed",
      },
      { new: true }
    );

    console.log("UPDATED:", updated);

    res.json(updated);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;