import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/axios";
import { connectSocket, disconnectSocket } from "@/lib/socket";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      workspaces: [],
      currentWorkspace: null,
      isLoading: false,
      error: null,

      register: async (name, email, password, workspaceName) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post("/auth/register", {
            name,
            email,
            password,
            workspaceName,
          });
          const { user, workspace, token } = data.data;
          localStorage.setItem("token", token);
          connectSocket(token);
          set({
            user,
            token,
            workspaces: [workspace],
            currentWorkspace: workspace,
            isLoading: false,
          });
          return { success: true, workspace };
        } catch (error) {
          const message =
            error.response?.data?.message || "Registration failed";
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post("/auth/login", { email, password });
          const { user, workspaces, token } = data.data;
          localStorage.setItem("token", token);
          connectSocket(token);
          set({
            user,
            token,
            workspaces,
            currentWorkspace: workspaces[0] || null,
            isLoading: false,
          });
          return { success: true, workspaces };
        } catch (error) {
          const message = error.response?.data?.message || "Login failed";
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch (error) {}
        localStorage.removeItem("token");
        disconnectSocket();
        set({
          user: null,
          token: null,
          workspaces: [],
          currentWorkspace: null,
        });
      },

      setCurrentWorkspace: (workspace) => {
        set({ currentWorkspace: workspace });
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);

export default useAuthStore;
