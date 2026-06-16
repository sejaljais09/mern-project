import express from "express";
import Signature from "../models/signature.js";

const router = express.Router();

router.get("/:documentId", async (req, res) => {
  try {
    const { documentId } = req.params;

    const signatures = await Signature.find({ documentId });

    const auditLogs = signatures.flatMap(sig => sig.auditTrail || []);

    res.json(auditLogs);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;