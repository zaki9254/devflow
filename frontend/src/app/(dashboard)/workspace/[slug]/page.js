"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import useAuthStore from "@/store/authStore";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function WorkspacePage() {
  const router = useRouter();
  const { slug } = useParams();
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [workspace, setWorkspace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.push("/login");
      return;
    }
    fetchWorkspace();
    fetchProjects();
  }, [hydrated, slug]);

  const fetchWorkspace = async () => {
    try {
      const { data } = await api.get(`/workspaces/${slug}`);
      setWorkspace(data.data.workspace);
    } catch (error) {
      toast.error("Failed to load workspace");
    }
  };

  const fetchProjects = async () => {
    try {
      const { data } = await api.get(`/workspaces/${slug}/projects`);
      setProjects(data.data.projects);
    } catch (error) {
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setCreating(true);
    try {
      const { data } = await api.post(`/workspaces/${slug}/projects`, {
        name: newProjectName,
      });
      setProjects([...projects, data.data.project]);
      setNewProjectName("");
      setShowCreateModal(false);
      toast.success("Project created!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const colors = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            onClick={() => router.push("/dashboard")}
            className="text-gray-400 hover:text-white cursor-pointer text-sm"
          >
            Dashboard
          </span>
          <span className="text-gray-600">/</span>
          <span className="text-white font-medium">{workspace?.name}</span>
        </div>
        <span className="text-gray-400 text-sm">{user?.name}</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">{workspace?.name}</h2>
            <p className="text-gray-400 mt-1">
              {projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + New Project
          </button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No projects yet</p>
            <p className="text-sm mt-2">
              Create your first project to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, index) => (
              <div
                key={project._id}
                onClick={() =>
                  router.push(`/workspace/${slug}/project/${project._id}`)
                }
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-indigo-500 cursor-pointer transition group"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg mb-4"
                  style={{
                    backgroundColor:
                      project.color || colors[index % colors.length],
                  }}
                >
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-semibold text-white group-hover:text-indigo-400 transition">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                    {project.description}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      project.status === "active"
                        ? "bg-green-900 text-green-400"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {project.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {project.members?.length} member
                    {project.members?.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-6">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Mobile App Redesign"
                  autoFocus
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 border border-gray-700 text-gray-400 hover:text-white py-2 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition"
                >
                  {creating ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
