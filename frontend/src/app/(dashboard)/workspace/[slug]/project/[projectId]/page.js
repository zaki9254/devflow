"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import useAuthStore from "@/store/authStore";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function ProjectPage() {
  const router = useRouter();
  const { slug, projectId } = useParams();
  const { user } = useAuthStore();

  const [project, setProject] = useState(null);
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [addingTask, setAddingTask] = useState(false);

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
    loadData();
  }, [hydrated, projectId]);

  const loadData = async () => {
    try {
      // Load project
      const { data: projectData } = await api.get(
        `/workspaces/${slug}/projects/${projectId}`,
      );
      setProject(projectData.data.project);

      // Load boards
      const { data: boardData } = await api.get(
        `/workspaces/${slug}/projects/${projectId}/boards`,
      );

      if (boardData.data.boards.length === 0) {
        // Auto-create a board if none exists
        const { data: newBoard } = await api.post(
          `/workspaces/${slug}/projects/${projectId}/boards`,
          { name: "Main Board" },
        );
        setBoard(newBoard.data.board);
        await loadTasks(newBoard.data.board._id, slug, projectId);
      } else {
        const firstBoard = boardData.data.boards[0];
        setBoard(firstBoard);
        await loadTasks(firstBoard._id, slug, projectId);
      }
    } catch (error) {
      toast.error("Failed to load project");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTasks = async (boardId, workspaceSlug, projId) => {
    try {
      const { data } = await api.get(
        `/workspaces/${workspaceSlug}/projects/${projId}/boards/${boardId}/tasks`,
      );
      setTasks(data.data.tasks);
    } catch (error) {
      toast.error("Failed to load tasks");
    }
  };

  const handleAddTask = async (columnName) => {
    if (!newTaskTitle.trim()) return;
    setAddingTask(true);
    try {
      const { data } = await api.post(
        `/workspaces/${slug}/projects/${projectId}/boards/${board._id}/tasks`,
        { title: newTaskTitle, column: columnName },
      );
      setTasks([...tasks, data.data.task]);
      setNewTaskTitle("");
      setShowAddTask(null);
      toast.success("Task added!");
    } catch (error) {
      toast.error("Failed to add task");
    } finally {
      setAddingTask(false);
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const newColumn = destination.droppableId;

    // Optimistic update — move task in UI immediately
    setTasks((prev) =>
      prev.map((t) =>
        t._id === draggableId ? { ...t, column: newColumn } : t,
      ),
    );

    // Save to backend
    try {
      await api.put(`/tasks/${draggableId}`, { column: newColumn });
    } catch (error) {
      toast.error("Failed to move task");
      // Revert on failure
      loadTasks(board._id, slug, projectId);
    }
  };

  const getTasksByColumn = (columnName) => {
    return tasks.filter((t) => t.column === columnName);
  };

  const priorityColor = {
    low: "bg-gray-700 text-gray-300",
    medium: "bg-blue-900 text-blue-300",
    high: "bg-orange-900 text-orange-300",
    urgent: "bg-red-900 text-red-300",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading board...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Navbar */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 text-sm">
          <span
            onClick={() => router.push("/dashboard")}
            className="text-gray-400 hover:text-white cursor-pointer"
          >
            Dashboard
          </span>
          <span className="text-gray-600">/</span>
          <span
            onClick={() => router.push(`/workspace/${slug}`)}
            className="text-gray-400 hover:text-white cursor-pointer"
          >
            {slug}
          </span>
          <span className="text-gray-600">/</span>
          <span className="text-white font-medium">{project?.name}</span>
        </div>
        <span className="text-gray-400 text-sm">{user?.name}</span>
      </div>

      {/* Board Header */}
      <div className="px-6 py-5 flex-shrink-0">
        <h2 className="text-xl font-bold">{project?.name}</h2>
        <p className="text-gray-400 text-sm mt-1">
          {board?.name} · {tasks.length} tasks
        </p>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto px-6 pb-8">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4" style={{ minWidth: "max-content" }}>
            {board?.columns?.map((column) => (
              <div key={column._id} className="w-72 flex-shrink-0">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    <span className="font-medium text-sm">{column.name}</span>
                    <span className="text-gray-500 text-xs bg-gray-800 px-2 py-0.5 rounded-full">
                      {getTasksByColumn(column.name).length}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowAddTask(column.name)}
                    className="text-gray-500 hover:text-white text-lg leading-none transition"
                  >
                    +
                  </button>
                </div>

                {/* Droppable Column */}
                <Droppable droppableId={column.name}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-24 rounded-xl p-2 transition-colors ${
                        snapshot.isDraggingOver ? "bg-gray-800" : "bg-gray-900"
                      }`}
                    >
                      {/* Tasks */}
                      {getTasksByColumn(column.name).map((task, index) => (
                        <Draggable
                          key={task._id}
                          draggableId={task._id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-gray-800 border rounded-lg p-3 mb-2 cursor-grab active:cursor-grabbing transition ${
                                snapshot.isDragging
                                  ? "border-indigo-500 shadow-lg shadow-indigo-500/20"
                                  : "border-gray-700 hover:border-gray-600"
                              }`}
                            >
                              <p className="text-sm font-medium text-white mb-2">
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${priorityColor[task.priority]}`}
                                >
                                  {task.priority}
                                </span>
                                {task.aiGenerated && (
                                  <span className="text-xs text-indigo-400">
                                    AI
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {/* Add Task Input */}
                      {showAddTask === column.name && (
                        <div className="mt-2">
                          <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddTask(column.name);
                              if (e.key === "Escape") setShowAddTask(null);
                            }}
                            placeholder="Task title..."
                            autoFocus
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleAddTask(column.name)}
                              disabled={addingTask}
                              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1.5 rounded-lg transition"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setShowAddTask(null)}
                              className="flex-1 border border-gray-600 text-gray-400 text-xs py-1.5 rounded-lg transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
