export const tourSteps = [
  {
    tour: "first-tour",
    steps: [
      {
        icon: "👋",
        title: "Welcome to Schema",
        content:
          "This is your dashboard overview. Let's take a quick tour to explore the key features.",
        selector: "#onborda-welcome",
        side: "bottom" as const,
        showControls: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: "📝",
        title: "Create & Manage Forms",
        content:
          "Head to the Forms section to create conversational forms with AI, edit themes, and manage settings.",
        selector: "#onborda-forms",
        side: "right" as const,
        showControls: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: "🎨",
        title: "Start with Templates",
        content:
          "Browse ready-made templates to kickstart your forms. Customize them to fit your needs.",
        selector: "#onborda-templates",
        side: "right" as const,
        showControls: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: "🏢",
        title: "Organize with Workspaces",
        content:
          "Use workspaces to group forms and collaborate with your team. Keep everything organized.",
        selector: "#onborda-workspaces",
        side: "right" as const,
        showControls: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: "📊",
        title: "Track Your Metrics",
        content:
          "Monitor total forms, submissions, views, and completion rates — all at a glance.",
        selector: "#onborda-stats",
        side: "top" as const,
        showControls: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: "⚡",
        title: "Quick Access",
        content:
          "Your recent forms are always just a click away. Jump back in where you left off.",
        selector: "#onborda-recent-forms",
        side: "top" as const,
        showControls: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
    ],
  },
];
