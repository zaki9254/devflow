const Board = require("../models/Board");
const Project = require("../models/Project");

// @desc    Create board
// @route   POST /api/projects/:projectId/boards
// @access  Private

const createBoard = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Board name is required",
      });
    }

    const project = await Project.findOne({
      _id: req.params.projectId,
      workspace: req.workspace._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const board = await Board.create({
      name,
      project: project._id,
      workspace: req.workspace._id,
    });

    res.status(201).json({
      success: true,
      message: "Board created",
      data: { board },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all boards in a project
// @route   GET /api/projects/:projectId/boards
// @access  Private

const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      project: req.params.projectId,
    });

    res.status(200).json({
      success: true,
      message: "Board Fetched",
      data: { boards },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single board by ID
// @route   GET /api/projects/:projectId/boards/:boardId
// @access  Private

const getBoard = async (req, res) => {
  try {
    const board = await Board.findOne({
      _id: req.params.boardId,
      project: req.params.projectId,
    });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Board Fetched",
      data: { board },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update board
// @route   PUT /api/projects/:projectId/boards/:boardId
// @access  Private

const updateBoard = async (req, res) => {
  try {
    const { name } = req.body;
    const board = await Board.findOne({
      _id: req.params.boardId,
      project: req.params.projectId,
    });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    if (name) board.name = name;
    await board.save();
    res.status(200).json({
      success: true,
      message: "Board updated",
      data: { board },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete board
// @route   DELETE /api/projects/:projectId/boards/:boardId
// @access  Private

const deleteBoard = async (req, res) => {
  try {
    const board = await Board.findOne({
      _id: req.params.boardId,
      project: req.params.projectId,
    });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    await board.deleteOne();

    res.json({
      success: true,
      message: "Board deleted.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard,
};
