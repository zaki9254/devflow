const Workspace = require("../models/Workspace");
const User = require("../models/User");
const generateSlug = require("../utils/generateSlug");

// @desc    Create workspace
// @route   POST /api/workspaces
// @access  Private
const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Workspace name is required.",
      });
    }

    const slug = generateSlug(name);

    const workspace = await Workspace.create({
      name,
      slug,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: "owner" }],
    });

    res.status(201).json({
      success: true,
      message: "Workspace created.",
      data: { workspace },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all workspaces for logged-in user
// @route   GET /api/workspaces
// @access  Private
const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      "members.user": req.user._id,
    }).populate("owner", "name email avatar");

    res.json({
      success: true,
      message: "Workspaces fetched.",
      data: { workspaces },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single workspace by slug
// @route   GET /api/workspaces/:slug
// @access  Private
const getWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findOne({
      slug: req.params.slug,
    })
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found.",
      });
    }

    const isMember = workspace.members.some(
      (m) => m.user._id.toString() === req.user._id.toString(),
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    res.json({
      success: true,
      message: "Workspace fetched.",
      data: { workspace },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update workspace
// @route   PUT /api/workspaces/:slug
// @access  Private (owner/admin only)
const updateWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;
    const workspace = req.workspace;

    if (name) workspace.name = name;
    if (description !== undefined) workspace.description = description;

    await workspace.save();

    res.json({
      success: true,
      message: "Workspace updated.",
      data: { workspace },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Invite member to workspace
// @route   POST /api/workspaces/:slug/invite
// @access  Private (owner/admin only)
const inviteMember = async (req, res) => {
  try {
    const { email, role = "member" } = req.body;
    const workspace = req.workspace;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    if (!["admin", "member"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be admin or member.",
      });
    }

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({
        success: false,
        message: "No user found with that email.",
      });
    }

    const alreadyMember = workspace.members.some(
      (m) => m.user.toString() === userToInvite._id.toString(),
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member.",
      });
    }

    workspace.members.push({ user: userToInvite._id, role });
    await workspace.save();

    res.json({
      success: true,
      message: `${userToInvite.name} added to workspace.`,
      data: {
        user: {
          _id: userToInvite._id,
          name: userToInvite.name,
          email: userToInvite.email,
        },
        role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove member from workspace
// @route   DELETE /api/workspaces/:slug/members/:userId
// @access  Private (owner only)
const removeMember = async (req, res) => {
  try {
    const workspace = req.workspace;
    const { userId } = req.params;

    if (userId === workspace.owner.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove the workspace owner.",
      });
    }

    const memberExists = workspace.members.some(
      (m) => m.user.toString() === userId,
    );

    if (!memberExists) {
      return res.status(404).json({
        success: false,
        message: "Member not found in workspace.",
      });
    }

    workspace.members = workspace.members.filter(
      (m) => m.user.toString() !== userId,
    );

    await workspace.save();

    res.json({ success: true, message: "Member removed." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  inviteMember,
  removeMember,
};
