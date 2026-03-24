const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.spliit("")[1];
    }
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized,No token provided",
      });
    }
  } catch (error) {}
};
