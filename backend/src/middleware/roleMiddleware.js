const Workspace = require("../models/Workspace");

const requireRole = (...roles) => {
  return async (req, res, next) => {
    try {
      const workspace = await Workspace.findOne({
        slug: req.params.slug,
      });

      if (!workspace) {
        return res.status(404).json({
          success: false,
          message: "Workspace not found",
        });
      }

      const member = workspace.members.find(
        (m) => m.user.toString() === req.user._id.toString(),
      );

      if (!member) {
        return res.status(403).json({
          success: false,
          message: "You are not a member of this workspace",
        });
      }

      if (!roles.includes(member.role)) {
        return res.status(403).json({
          success: false,
          message: `Required role:${roles.join("or")} Your role :${member.role}`,
        });
      }

      // Attach workspace and role to request for use in controllers

      req.workspace = workspace;
      req.memberRole = member.role;

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
};

module.exports = { requireRole };
