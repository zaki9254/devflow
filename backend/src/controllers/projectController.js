const Project = require("../models/Project");

// @desc    Create project
// @route POST /api/projects
// @access Private

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    const project = await Project.create({
      name,
      description,
      workspace: req.workspace._id,
      members: [req.user._id],
    });

    res.status(201).json({
      success: true,
      message: "Project created.",
      data: { project },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all projects in a workspace
// @route   GET /api/projects
// @access  Private

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ workspace: req.workspace._id });
    res.json({
      success: true,
      data: { projects },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private

const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      workspace: req.workspace._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    res.json({
      success: true,
      data: { project },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private

const updateProject = async (req, res) => {
  try {
    const { name, description, color, status } = req.body;
    const project = await Project.findOne({
      _id: req.params.id,
      workspace: req.workspace._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    if (name) project.name = name;
    if (description) project.description = description;
    if (color) project.color = color;
    if (status) project.status = status;

    await project.save();

    res.json({
      success: true,
      message: "Project updated.",
      data: { project },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      workspace: req.workspace._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    res.json({
      success: true,
      message: "Project deleted.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
};
