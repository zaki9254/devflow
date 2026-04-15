const express = require("express");
const router = express.Router();
const { suggestTasksForBoard } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.post("/suggest-tasks", suggestTasksForBoard);

module.exports = router;
