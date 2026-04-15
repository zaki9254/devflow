const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard,
} = require("../controllers/boardController");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const taskRoutes = require("./taskRoutes");

router.use(protect);
router.use(requireRole("owner", "admin", "member"));

router
  .route("/")
  .get(getBoards)
  .post(requireRole("owner", "admin"), createBoard);

router
  .route("/:boardId")
  .get(getBoard)
  .put(requireRole("owner", "admin"), updateBoard)
  .delete(requireRole("owner", "admin"), deleteBoard);

router.use("/:boardId/tasks", taskRoutes);

module.exports = router;
