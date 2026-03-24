const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    type: {
      type: String,
      enum: [
        "task_assigned",
        "task_due",
        "comment_added",
        "workspace_invite",
        "project_added",
        "mention",
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: "",
    },
    read: {
      type: Boolean,
      default: false,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "workspace",
      default: null,
    },
  },
  { timestamps: true },
);

// Index so we can quickly fetch all unread notifications for a user

notificationSchema.index({ recipent: 1, read: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
