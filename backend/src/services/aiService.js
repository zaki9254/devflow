const suggestTasks = async (projectDescription, boardColumns) => {
  // Mock response — replace with real OpenAI call when you have credits
  const mockTasks = [
    {
      title: "Set up project repository",
      description:
        "Initialize Git repo, create folder structure, install dependencies",
      priority: "high",
      column: "To Do",
    },
    {
      title: "Design database schema",
      description:
        "Plan and create all required database models and relationships",
      priority: "high",
      column: "To Do",
    },
    {
      title: "Build authentication system",
      description: "Implement register, login, JWT auth and protected routes",
      priority: "high",
      column: "To Do",
    },
    {
      title: "Create REST API endpoints",
      description: "Build all required CRUD endpoints with proper validation",
      priority: "medium",
      column: "To Do",
    },
    {
      title: "Design UI mockups",
      description: "Create wireframes for all main screens in Figma",
      priority: "medium",
      column: "To Do",
    },
    {
      title: "Build frontend components",
      description:
        "Develop reusable React components following the design system",
      priority: "medium",
      column: "To Do",
    },
    {
      title: "Integrate frontend with API",
      description: "Connect React frontend to backend using axios",
      priority: "medium",
      column: "To Do",
    },
    {
      title: "Write unit tests",
      description: "Test all API endpoints and critical business logic",
      priority: "low",
      column: "To Do",
    },
  ];

  return mockTasks;
};

module.exports = { suggestTasks };
