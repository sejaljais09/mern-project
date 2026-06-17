import express from "express";
import Signature from "../models/signature.js";
import { body, validationResult } from "express-validator";
import { sendSigningEmail } from "../utils/sendEmail.js";
import getIp from "../middleware/getIp.js";
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
    const { documentId, x, y, signer, email ,pageNumber} = req.body;

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
      pageNumber,
    });
   console.log("NEW SIGNATURE:", signature);
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



router.put("/:id/sign", getIp, async (req, res) => {
  try {
    console.log("🔥 SIGN ROUTE HIT");

    const { signatureImage } = req.body;

    const signature = await Signature.findById(req.params.id);

    if (!signature) {
      return res.status(404).json({ message: "Not found" });
    }

    console.log("BEFORE AUDIT:", signature.auditTrail);

    signature.signatureImage = signatureImage;
    signature.status = "signed";
    signature.signedAt = new Date();
    signature.ipAddress = req.clientIp || "unknown";

    // 🔥 AUDIT TRAIL PUSH
    signature.auditTrail.push({
      action: "SIGNED",
      ip: req.clientIp || "unknown",
      user: signature.email,
      timestamp: new Date(),
    });

    await signature.save();

    console.log("AFTER AUDIT:", signature.auditTrail);

    res.json(signature);
  } catch (error) {
    console.log("ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});


//router for reject
router.put("/:id/reject", getIp, async (req, res) => {
  try {
    const signature = await Signature.findById(req.params.id);

    if (!signature) {
      return res.status(404).json({ message: "Not found" });
    }

    // if (signature.status === "signed") {
    //   return res.status(400).json({
    //     message: "Already signed, cannot reject",
    //   });
    // }

    const { reason } = req.body; // ✅ required

    // signature.status = "rejected";
    // signature.rejectionReason = reason || "No reason provided";

    // signature.auditTrail.push({
    //   action: "REJECTED",
    //   ip: req.clientIp || "unknown",
    //   user: signature.email,
    //   timestamp: new Date(),
    // });

  
    await Signature.findByIdAndDelete(req.params.id);
    res.json({
  message: "Signature deleted successfully",
});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/token/:token", async (req, res) => {
  console.log("TOKEN ROUTE HIT:", req.params.token);

  try {
    const signature = await Signature.findOne({
      token: req.params.token,
    });

    console.log("SIGNATURE FOUND:", signature);

    if (!signature) {
      return res.status(404).json({
        message: "Invalid token",
      });
    }

    if (new Date() > signature.tokenExpires) {
      return res.status(400).json({
        message: "Token expired",
      });
    }

    res.json(signature);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});


router.post("/:id/send-email", async (req, res) => {
  try {
    const signature = await Signature.findById(req.params.id);

    if (!signature) {
      return res.status(404).json({
        message: "Signature not found",
      });
    }

    await sendSigningEmail(
      signature.email,
      signature.token
    );

    res.json({
      message: "Email sent successfully",
    });

  } catch (error) {
    console.log("EMAIL ERROR:", error);
    console.log("MESSAGE:", error.message);
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;