import { create } from "zustand";
import api from "@/lib/axios";

const useBoardStore = create((set, get) => ({
  boards: [],
  currentBoard: null,
  tasks: [],
  isLoading: false,

  fetchBoards: async (workspaceSlug, projectId) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get(
        `/workspaces/${workspaceSlug}/projects/${projectId}/boards`,
      );
      set({ boards: data.data.boards, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  fetchTasks: async (workspaceSlug, projectId, boardId) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get(
        `/workspaces/${workspaceSlug}/projects/${projectId}/boards/${boardId}/tasks`,
      );
      set({ tasks: data.data.tasks, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  setCurrentBoard: (board) => set({ currentBoard: board }),

  // Called when Socket.io receives task-updated event
  updateTaskInStore: (updatedTask) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t._id === updatedTask._id ? updatedTask : t,
      ),
    }));
  },

  // Called when Socket.io receives task-deleted event
  removeTaskFromStore: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t._id !== taskId),
    }));
  },

  // Called when Socket.io receives tasks-ai-generated event
  addTasksToStore: (newTasks) => {
    set((state) => ({
      tasks: [...state.tasks, ...newTasks],
    }));
  },
}));

export default useBoardStore;
