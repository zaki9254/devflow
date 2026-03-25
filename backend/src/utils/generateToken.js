const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, "devflow_jwt_secret_2024", {
    expiresIn: "7d",
  });
};

module.exports = generateToken;
