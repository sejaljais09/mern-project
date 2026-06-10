const mongoose =require('mongoose');

const connectDB =async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connectde");
    }catch(error){
        console.error(error.message);
        process.exit(1);
    }

};
export default connectDB;