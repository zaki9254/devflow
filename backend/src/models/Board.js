const mongoose = require("mongoose");
const columnSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  order: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    default: "#e2e8f0",
  },
});

const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Board name is required"],
      trim: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Projects",
      required: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspaces",
      required: true,
    },
    columns: {
      type: [columnSchema],
      default: [
        { name: "To Do", order: 0, color: "#e2e8f0" },
        { name: "In Progress", order: 1, color: "#bfdbfe" },
        { name: "In Review", order: 2, color: "#fef08a" },
        { name: "Done", order: 3, color: "#bbf7d0" },
      ],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Board", boardSchema);
