import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
     
        dbName: "test",
    });
    

    console.log("MongoDB Connected");
    
    console.log("Database Name:", mongoose.connection.name);
   console.log(mongoose.connection.name);
} catch (error) {


    console.error(error.message);
    process.exit(1);
  }
};

export default connectDB;