import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    passwordHash: {type: String, required: true}, 
    name: {type: String, required: true},
    provider: {type: String, enum: ['local', 'google'], default: 'local'},
    googleId: {type: String, unique: true, sparse: true},
    role: {type: String, enum: ['admin', 'user'], default: 'user'}
}, {
    timestamps: true
})

const User = mongoose.model("User", userSchema);

export default User;