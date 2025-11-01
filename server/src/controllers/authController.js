import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Signup
export const signup = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user with all fields from req.body
    const user = await User.create(req.body);

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, { httpOnly: true, secure: false });

    // Respond with user (excluding password)
    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      location: user.location,
      farmSize: user.farmSize,
      language: user.language,
    });

    
  } catch (err) {
    next(err);
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      res.cookie('token', token, { httpOnly: true, secure: false });
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        location: user.location,
        farmSize: user.farmSize,
        language: user.language,
      });
      return res.redirect('/');
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    next(err);
  }
};

// Logout
export const logout = (req, res, next) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: false, 
      sameSite: 'strict',
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// Get current user
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    next(err);
  }
};