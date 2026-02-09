// /Users/homefolder/Desktop/Projects/project/frontend/src/components/Dashboard/Dashboard.jsx

import { useState } from "react";
import { Overview } from "./Overview";
import Study from "./Recorder";
import StudyManager from "./Timer";
import Rankings from "./Rankings";
import Community from "./Community";

export default function Dashboard() {
  const [activeItem, setActiveItem] = useState("rankings");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: "rankings", name: "Rankings", icon: "🏆" },
    { id: "study", name: "Study Session Recorder", icon: "🎥" },
    { id: "studyManager", name: "Deep Work Timer", icon: "⏱️" },
    { id: "overview", name: "Analytics", icon: "📊" },
    { id: "community", name: "Community", icon: "💬", badge: "Live" },
    { id: "settings", name: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      {/* Sidebar */}
      <aside
        className={`${
          isCollapsed ? "w-20" : "w-64"
        } transition-all duration-300 ease-in-out bg-white/60 backdrop-blur-xl border-r border-slate-200/50 flex flex-col`}
      >
        {/* Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200/50 flex-shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/30">
                S
              </div>
              <h2 className="font-bold text-lg text-slate-800">FocusRank</h2>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-white/80 rounded-md transition-colors text-slate-500 hover:text-slate-700"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                activeItem === item.id
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-600 hover:bg-white/80 hover:text-slate-900"
              }`}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="font-medium text-sm truncate">
                    {item.name}
                  </span>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        activeItem === item.id
                          ? "bg-white/25 text-white"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile Section */}
        {!isCollapsed && (
          <div className="p-3 border-t border-slate-200/50 flex-shrink-0">
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-white/80 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  John Doe
                </p>
                <p className="text-xs text-slate-500 truncate">
                  john@example.com
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Top Header Bar */}
        <header className="h-14 bg-white/40 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-slate-800">
              {navItems.find((item) => item.id === activeItem)?.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/60 rounded-lg transition-colors">
              <svg
                className="w-5 h-5 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            <button className="p-2 hover:bg-white/60 rounded-lg transition-colors">
              <svg
                className="w-5 h-5 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Message */}
            <div className="mb-6">
              <p className="text-sm text-slate-600">
                Welcome back! Here's what's happening with your studies today.
              </p>
            </div>

            {/* Content Container */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm overflow-hidden">
              <div className="p-6">
                {activeItem === "rankings" && <Rankings />}
                {activeItem === "study" && <Study />}
                {activeItem === "studyManager" && <StudyManager />}
                {activeItem === "overview" && <Overview />}
                {activeItem === "community" && <Community />}
                {activeItem === "settings" && (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                      <svg
                        className="w-8 h-8 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      Settings
                    </h3>
                    <p className="text-sm text-slate-500">
                      Configure your preferences
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
