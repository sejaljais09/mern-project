import express from "express";
import Signature from "../models/signature.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { documentId, x, y, signer } = req.body;

    const signature = await Signature.create({
      documentId,
      x,
      y,
      signer,
    });

    res.status(201).json(signature);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
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


router.post("/", async (req, res) => {
  try {
    const {
      documentId,
      x,
      y,
      signer,
      email,
      status,
    } = req.body;

    const signature = await Signature.create({
      documentId,
      x,
      y,
      signer,
      email,
      status,
    });

    res.status(201).json(signature);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});


export default router;