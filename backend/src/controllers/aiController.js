const Task = require("../models/Task");
const Board = require("../models/Board");
const Project = require("../models/Project");
const { suggestTasks } = require("../services/aiService");

// @desc    Generate AI task suggestions and save to board
// @route   POST /api/ai/suggest-tasks
// @access  Private
const suggestTasksForBoard = async (req, res) => {
  try {
    const { description, boardId, projectId } = req.body;

    if (!description || !boardId) {
      return res.status(400).json({
        success: false,
        message: "Project description and boardId are required.",
      });
    }

    // Find the board
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found.",
      });
    }

    // Call OpenAI service
    const suggestedTasks = await suggestTasks(description, board.columns);

    // Save all suggested tasks to the board
    const savedTasks = await Promise.all(
      suggestedTasks.map((t) =>
        Task.create({
          title: t.title,
          description: t.description,
          priority: t.priority || "medium",
          column: t.column || board.columns[0].name,
          board: board._id,
          project: board.project,
          workspace: board.workspace,
          aiGenerated: true,
        }),
      ),
    );

    // Emit real-time event so all board users see new tasks instantly
    const io = req.app.get("io");
    io.to(`board:${board._id}`).emit("tasks-ai-generated", {
      tasks: savedTasks,
    });

    res.status(201).json({
      success: true,
      message: `${savedTasks.length} AI tasks generated successfully.`,
      data: { tasks: savedTasks },
    });
  } catch (error) {
    // Handle JSON parse error from OpenAI response
    if (error instanceof SyntaxError) {
      return res.status(500).json({
        success: false,
        message: "AI returned invalid response. Please try again.",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { suggestTasksForBoard };
