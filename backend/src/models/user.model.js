import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: [true, "Username already exists"],
    },

    email: {
        type: String,
        required: true,
        unique: [true, "Email already exists"],
    },
    
    password: {
        type: String,
        required: true,
    },
},{timestamps: true});

const User = mongoose.model("User", userSchema);

export default User;