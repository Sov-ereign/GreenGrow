import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phoneNumber: { type: String },
    location: { type: String },
    farmSize: { type: Number }, // acres
    language: { type: String, default: 'English' }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);