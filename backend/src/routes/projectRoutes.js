const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const boardRoutes = require("./boardRoutes");

router.use(protect);
router.use(requireRole("owner", "admin", "member"));

router
  .route("/")
  .get(getProjects)
  .post(requireRole("owner", "admin"), createProject);

router
  .route("/:id")
  .get(getProject)
  .put(requireRole("owner", "admin"), updateProject)
  .delete(requireRole("owner", "admin"), deleteProject);

router.use("/:projectId/boards", boardRoutes);

module.exports = router;
