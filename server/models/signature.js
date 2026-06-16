import mongoose from "mongoose";
import crypto from "crypto";

const signatureSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },

    x: {
      type: Number,
      required: true,
    },

    y: {
      type: Number,
      required: true,
    },

    signer: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "signed", "rejected"],
      default: "pending",
    },

    signatureImage: {
      type: String,
      default: "",
    },

    token: {
  type: String,
  default: () => crypto.randomBytes(32).toString("hex"),
},

tokenExpires: {
  type: Date,
  default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
},

signedAt: {
  type: Date,
},

ipAddress: {
  type: String,
  default: "",
},

auditTrail: [
  {
    action: {
      type: String,
      enum: ["VIEWED", "SIGNED", "DOWNLOADED", "LINK_OPENED", "REJECTED"],
    },
    ip: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    user: String,
  },
],
rejectionReason: {
  type: String,
  default: "",
},
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Signature", signatureSchema);