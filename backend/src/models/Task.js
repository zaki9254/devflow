const mongooose = require("mongoose");

const commentSchema = new mongooose.Schema(
  {
    user: {
      type: mongooose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

const taskSchema = new mongooose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    board: {
      type: mongooose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    project: {
      type: mongooose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    workspace: {
      type: mongooose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    column: {
      type: String,
      required: true,
    },
    assignees: [
      {
        type: mongooose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "in_review", "done"],
      default: "todo",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    attachments: [
      {
        filename: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    comments: [commentSchema],
    aiGenerated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

//Index for fast board queries -  we'll query tasks by board + column constantly

taskSchema.index({ board: 1, column: 1 });
taskSchema.index({ workspace: 1 });
taskSchema.index({ assignees: 1 });

module.exports = mongooose.model("Task", taskSchema);
