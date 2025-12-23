import {hashPassword, comparePassword} from "../utils/hash.js";
import User from "../models/User.js";

class UserService {
    static async registerUser({email, password, name}) {
        const existingUser = await User.findOne({email});
        if (existingUser) {
            throw new Error("Email already in use");
        }

        const passwordHash = await hashPassword(password);
        const newUser = new User({email, passwordHash, name, provider: 'local'});
        await newUser.save();
        return newUser;
    }

    static async loginLocal({email, password}) {
        const user = await User.findOne({email});
        if (!user) {
            throw new Error("Invalid email or password");
        }
        if(user.provider !== 'local') {
            throw new Error("Please login using Google");
        }
        const isMatch = await comparePassword(password, user.passwordHash);
        if (!isMatch) {
            throw new Error("Invalid email or password");
        }
        return user;
    }

    static async loginGoogle({email,name,googleId}) {
        let user = await User.findOne({$or: [{email}, {googleId}]});
        if (!user) {
            user = new User({email, name, googleId, provider: 'google'});
            await user.save();
        }
        return user;
    }

    static async getUserById(userId) {
        const user = await User.findById(userId).select('-passwordHash');
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }

    static async getUserByEmail(email) {
        const user = await User.findOne({email}).select('-passwordHash');
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }

    static async findUserByEmail(email) {
        const user = await User.findOne({email}).select('-passwordHash');
        return user; // Returns null if user not found, doesn't throw error
    }

    static async setPasswordResetToken(email, resetToken, resetExpires) {
        const user = await User.findOneAndUpdate(
            { email },
            { 
                passwordResetToken: resetToken,
                passwordResetExpires: resetExpires
            },
            { new: true }
        ).select('-passwordHash');
        
        if (!user) {
            throw new Error("User not found");
        }
        
        return user;
    }

    static async findUserByResetToken(tokenHash) {
        const user = await User.findOne({
            passwordResetToken: tokenHash,
            passwordResetExpires: { $gt: new Date() }
        }).select('-passwordHash');
        
        return user; // Returns null if not found or expired
    }

    static async updatePassword(userId, newPassword) {
        const passwordHash = await hashPassword(newPassword);
        const user = await User.findByIdAndUpdate(
            userId,
            { 
                passwordHash: passwordHash,
                passwordResetToken: undefined,
                passwordResetExpires: undefined
            },
            { new: true }
        ).select('-passwordHash');
        
        if (!user) {
            throw new Error("User not found");
        }
        
        return user;
    }

    static async getAllUsers() {
        const users = await User.find().select('-passwordHash');
        return users;
    }

    static async deleteUser(userId) {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }

    static async updateUser(userId, updateData) {
        const user = await User.findByIdAndUpdate(userId, updateData, {new: true}).select('-passwordHash');
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
}

export default UserService;