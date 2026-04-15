const Task = require("../models/Task");
const Board = require("../models/Board");

// @ desc    Create a new task
// @ route   POST /api/tasks
// @ access  Private

const createTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const board = await Board.findById(req.params.boardId);
    if (!board) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found." });
    }

    const task = await Task.create({
      title,
      description,
      board: board._id,
      project: board.project,
      workspace: board.workspace,
      column: board.columns[0].name, // default to first column "To Do"
    });

    res.status(201).json({
      success: true,
      message: "Task created.",
      data: { task },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating task",
    });
  }
};

// @ desc    Get all tasks for a board
// @ route   GET /api/tasks
// @ access  Private

const getTasks = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found.",
      });
    }

    const tasks = await Task.find({ board: req.params.boardId }).populate(
      "assignees",
      "name email avatar",
    );
    res.status(200).json({
      success: true,
      message: "Tasks fetched",
      data: { tasks },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching tasks",
    });
  }
};

// @desc update a task
// @route PUT /api/tasks/:taskId
// @access Private

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.taskId,
      req.body,
      { new: true, runValidators: true },
    ).populate("assignees", "name email avatar");

    // Emit real-time event to all users on this board
    const io = req.app.get("io");
    io.to(`board:${updatedTask.board}`).emit("task-updated", {
      task: updatedTask,
    });

    res.status(200).json({
      success: true,
      message: "Task updated",
      data: { task: updatedTask },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating task",
    });
  }
};

// @desc delete a task
// @route DELETE /api/tasks/:taskId
// @access Private

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
    await task.deleteOne();

    const io = req.app.get("io");
    io.to(`board:${task.board}`).emit("task-deleted", { taskId: task._id });
    res.status(200).json({
      success: true,
      message: "Task deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};
