import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    
    originalName: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId:{
      type:String,
    },
    mimetype:{
     type:String,
    } ,
    
    size: {
      type: Number,
    },
   
  },
  { timestamps: true }
);

const Document = mongoose.models.Document || mongoose.model("Document", documentSchema);

export default Document;