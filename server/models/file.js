import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({

  originalName: {
    type: String,
  },
  url: {
    type: String,
    required: true,
  },
  size: Number,

  mimetype: String,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const File = mongoose.model("File", fileSchema);

export default File;