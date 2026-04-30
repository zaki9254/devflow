const User = require("../models/User");
const Workspace = require("../models/Workspace");
const generateToken = require("../utils/generateToken");
const generateSlug = require("../utils/generateSlug");

let redis;
try {
  redis = require("../config/redis");
} catch (e) {
  redis = null;
}

const register = async (req, res) => {
  try {
    const { name, email, password, workspaceName } = req.body;

    if (!name || !email || !password || !workspaceName) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, password and workspace name.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    const newUser = await User.create({ name, email, password });

    const slug = generateSlug(workspaceName);
    const workspace = await Workspace.create({
      name: workspaceName,
      slug,
      owner: newUser._id,
      members: [{ user: newUser._id, role: "owner" }],
    });

    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: {
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          avatar: newUser.avatar,
        },
        workspace: {
          _id: workspace._id,
          name: workspace.name,
          slug: workspace.slug,
          plan: workspace.plan,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error); // Add this line
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    const foundUser = await User.findOne({ email });

    if (!foundUser || !foundUser.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await foundUser.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const workspaces = await Workspace.find({
      "members.user": foundUser._id,
    }).select("name slug logo plan");

    const token = generateToken(foundUser._id);

    try {
      if (redis) {
        await redis.setex(
          `session:${foundUser._id}`,
          7 * 24 * 60 * 60,
          JSON.stringify({ _id: foundUser._id, email: foundUser.email }),
        );
      }
    } catch (redisError) {
      console.log("Redis unavailable, skipping session cache");
    }

    res.json({
      success: true,
      message: "Login successful.",
      data: {
        user: {
          _id: foundUser._id,
          name: foundUser.name,
          email: foundUser.email,
          avatar: foundUser.avatar,
        },
        workspaces,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      "members.user": req.user._id,
    }).select("name slug logo plan");

    res.json({
      success: true,
      message: "User fetched.",
      data: {
        user: req.user,
        workspaces,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    try {
      if (redis) {
        await redis.del(`session:${req.user._id}`);
      }
    } catch (redisError) {
      console.log("Redis unavailable, skipping session delete");
    }
    res.json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, logout };
