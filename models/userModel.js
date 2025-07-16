import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    profileImage:{
        type: String,
        default: null
    },
    resetToken: {
        type: String,
        default: null
    },
    resetTokenExpiration: {
        type: Date,
        default: null
    }
},{
    timestamps: true,
})


// create a pre model to hash the password before saving
userSchema.pre("save",async function(){
    console.log("Before saving user:", this);
    if(this.isModified("password")){
        console.log("Hashing password for user:", this.password);
        // await bcryprt.hash(to change, salt)
        this.password = await bcrypt.hash(this.password, 10);
    }
})

// // Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        console.log("Password match result:", isMatch);
        return isMatch;
    } catch (error) {
        console.error("Error comparing passwords:", error);
        throw error;
    }
}
// Method to generate a reset token
userSchema.methods.generateResetToken = function() {
    // const token = Math.random().toString(36).substring(2, 15);
    const token = crypto.randomBytes(32).toString("hex");
    console.log("Generated reset token:", token);
    this.resetToken = token;
    this.resetTokenExpiration = Date.now() + 3600000; // Token valid for 1 hour
    console.log("Generated reset token:", token);
    return token;
}

const UserModel = mongoose.model('User', userSchema);
export default UserModel;