"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";

export default function DashboardPage() {
  const router = useRouter();
  const { user, workspaces, logout, currentWorkspace } = useAuthStore();

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !user) {
      router.push("/login");
    }
  }, [hydrated, user]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-400">DevFlow</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold">Welcome back, {user?.name} 👋</h2>
          <p className="text-gray-400 mt-2">Here are your workspaces</p>
        </div>

        {/* Workspaces */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((workspace) => (
            <div
              key={workspace._id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-indigo-500 cursor-pointer transition"
              onClick={() => router.push(`/workspace/${workspace.slug}`)}
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg mb-4">
                {workspace.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-semibold text-white">{workspace.name}</h3>
              <p className="text-gray-500 text-sm mt-1 capitalize">
                {workspace.plan} plan
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
