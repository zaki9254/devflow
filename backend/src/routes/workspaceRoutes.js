const express = require("express");
const router = express.Router();

const projectRoutes = require("./projectRoutes");
const {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  inviteMember,
  removeMember,
} = require("../controllers/workspaceController");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

router.use(protect);

router.route("/").get(getWorkspaces).post(createWorkspace);

router
  .route("/:slug")
  .get(getWorkspace)
  .put(requireRole("owner", "admin"), updateWorkspace);

router.post("/:slug/invite", requireRole("owner", "admin"), inviteMember);
router.delete("/:slug/members/:userId", requireRole("owner"), removeMember);

router.use("/:slug/projects", projectRoutes);
module.exports = router;
