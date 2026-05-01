const User = require("../models/User");
const { generateToken, sendResponse } = require("../utils/helpers");

// ─── @POST /api/auth/register ──────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role, companyName } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendResponse(res, 409, false, "Email is already registered.");
    }

    const userData = { fullName, email, password, role: role || "student" };
    if (role === "admin" && companyName) userData.companyName = companyName;

    const user = await User.create(userData);
    
    const userObj = user.toJSON();
    delete userObj.password;
    
    const token = generateToken(user._id);
    sendResponse(res, 201, true, "Account created successfully!", {
      token,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/auth/login ─────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, 400, false, "Please provide email and password.");
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return sendResponse(res, 401, false, "Invalid email or password.");
    }

    if (!user.isActive) {
      return sendResponse(res, 403, false, "Your account has been deactivated.");
    }

    const token = generateToken(user._id);

    // Return user without password
    const userObj = user.toJSON();
    delete userObj.password;

    sendResponse(res, 200, true, "Logged in successfully!", {
      token,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/auth/me ─────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    sendResponse(res, 200, true, "User profile fetched.", { user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
