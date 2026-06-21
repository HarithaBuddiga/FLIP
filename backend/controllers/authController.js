const { validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');

const isProduction = process.env.NODE_ENV === 'production';

const getCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const sendAuthResponse = (res, statusCode, user, message) => {
  const token = generateToken(user._id);
  const userObj = user.toJSON();

  res
    .cookie('flip_token', token, getCookieOptions())
    .status(statusCode)
    .json({
      success: true,
      message,
      data: { user: userObj },
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const user = await User.create({ name, email, password });

    sendAuthResponse(res, 201, user, 'Account created successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const { email, password } = req.body;

    // Explicitly select password (it's excluded by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been disabled.',
      });
    }

    sendAuthResponse(res, 200, user, 'Logged in successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Logout current user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  res
    .clearCookie('flip_token', getCookieOptions())
    .json({
      success: true,
      message: 'Logged out successfully.',
    });
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
};

module.exports = { register, login, logout, getMe };
