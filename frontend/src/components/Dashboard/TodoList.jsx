import { useState, useRef, useEffect } from "react";

const PRIORITIES = {
  urgent: { label: "Urgent", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30", dot: "bg-red-400" },
  high:   { label: "High",   color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/30", dot: "bg-orange-400" },
  medium: { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30", dot: "bg-yellow-400" },
  low:    { label: "Low",    color: "text-slate-400",  bg: "bg-slate-400/10",  border: "border-slate-400/20",  dot: "bg-slate-500" },
};

const TAGS = ["Study", "Work", "Personal", "Health", "Project", "Reading"];

const TAG_COLORS = {
  Study: "bg-violet-500/15 text-violet-300 border-violet-500/20",
  Work: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  Personal: "bg-pink-500/15 text-pink-300 border-pink-500/20",
  Health: "bg-green-500/15 text-green-300 border-green-500/20",
  Project: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
  Reading: "bg-amber-500/15 text-amber-300 border-amber-500/20",
};

const initialTasks = [
  { id: 1, text: "Review lecture notes on neural networks", priority: "urgent", tags: ["Study"], dueDate: new Date().toISOString().split("T")[0], completed: false, subtasks: [{ id: 11, text: "Chapter 4 - Backpropagation", done: false }, { id: 12, text: "Chapter 5 - CNNs", done: true }], createdAt: Date.now() - 86400000 },
  { id: 2, text: "Complete assignment 3 writeup", priority: "high", tags: ["Study", "Project"], dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0], completed: false, subtasks: [], createdAt: Date.now() - 3600000 },
  { id: 3, text: "30 min morning run", priority: "medium", tags: ["Health"], dueDate: new Date().toISOString().split("T")[0], completed: true, subtasks: [], createdAt: Date.now() - 7200000 },
  { id: 4, text: "Read 'Deep Work' — Chapter 6", priority: "low", tags: ["Reading"], dueDate: "", completed: false, subtasks: [], createdAt: Date.now() - 1800000 },
];

function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }, [key, val]);
  return [val, setVal];
}

function formatDate(d) {
  if (!d) return null;
  const date = new Date(d + "T00:00:00");
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.floor((date - today) / 86400000);
  if (diff === 0) return { label: "Today", overdue: false, soon: false };
  if (diff === 1) return { label: "Tomorrow", overdue: false, soon: true };
  if (diff === -1) return { label: "Yesterday", overdue: true, soon: false };
  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, overdue: true, soon: false };
  if (diff <= 3) return { label: `In ${diff}d`, overdue: false, soon: true };
  return { label: date.toLocaleDateString("en", { month: "short", day: "numeric" }), overdue: false, soon: false };
}

export default function TodoList() {
  const [tasks, setTasks] = useLocalStorage("focus-tasks", initialTasks);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("medium");
  const [selectedTags, setSelectedTags] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [view, setView] = useState("today"); // today | all | done
  const [filterTag, setFilterTag] = useState(null);
  const [sortBy, setSortBy] = useState("created"); // created | priority | due
  const [expandedTask, setExpandedTask] = useState(null);
  const [newSubtask, setNewSubtask] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const inputRef = useRef(null);

  const today = new Date().toISOString().split("T")[0];
  const streak = (() => {
    const completed = tasks.filter(t => t.completed);
    return completed.length > 0 ? Math.min(completed.length, 7) : 0;
  })();

  const todayTotal = tasks.filter(t => t.dueDate === today).length;
  const todayDone  = tasks.filter(t => t.dueDate === today && t.completed).length;
  const progress   = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

  const filteredTasks = tasks
    .filter(t => {
      if (view === "today") return t.dueDate === today && !t.completed;
      if (view === "done") return t.completed;
      return !t.completed;
    })
    .filter(t => !filterTag || t.tags.includes(filterTag))
    .sort((a, b) => {
      if (sortBy === "priority") {
        const order = { urgent: 0, high: 1, medium: 2, low: 3 };
        return order[a.priority] - order[b.priority];
      }
      if (sortBy === "due") {
        if (!a.dueDate) return 1; if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      return b.createdAt - a.createdAt;
    });

  function addTask() {
    if (!input.trim()) return;
    const task = {
      id: Date.now(), text: input.trim(), priority,
      tags: [...selectedTags], dueDate, completed: false,
      subtasks: [], createdAt: Date.now(),
    };
    setTasks(p => [task, ...p]);
    setInput(""); setSelectedTags([]); setDueDate(""); setPriority("medium");
    setShowAddForm(false);
  }

  function toggleTask(id) {
    setCompletingId(id);
    setTimeout(() => {
      setTasks(p => p.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
      setCompletingId(null);
    }, 400);
  }

  function deleteTask(id) {
    setTasks(p => p.filter(t => t.id !== id));
  }

  function toggleSubtask(taskId, subId) {
    setTasks(p => p.map(t => t.id === taskId
      ? { ...t, subtasks: t.subtasks.map(s => s.id === subId ? { ...s, done: !s.done } : s) }
      : t));
  }

  function addSubtask(taskId) {
    const text = (newSubtask[taskId] || "").trim();
    if (!text) return;
    setTasks(p => p.map(t => t.id === taskId
      ? { ...t, subtasks: [...t.subtasks, { id: Date.now(), text, done: false }] }
      : t));
    setNewSubtask(p => ({ ...p, [taskId]: "" }));
  }

  function toggleTag(tag) {
    setSelectedTags(p => p.includes(tag) ? p.filter(t => t !== tag) : [...p, tag]);
  }

  const allTags = [...new Set(tasks.flatMap(t => t.tags))];

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white font-sans flex items-start justify-center py-10 px-4"
         style={{ fontFamily: "'DM Sans', 'DM Mono', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { font-family: 'DM Sans', system-ui, sans-serif; }
        .mono { font-family: 'DM Mono', monospace; }
        .task-enter { animation: taskIn 0.25s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes taskIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .completing { animation: completeOut 0.4s ease forwards; }
        @keyframes completeOut { to{opacity:0;transform:translateX(12px) scale(0.97)} }
        .progress-bar { transition: width 0.6s cubic-bezier(0.16,1,0.3,1); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a2e; border-radius: 4px; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
        .tag-pill { transition: all 0.15s ease; }
        .tag-pill:hover { transform: scale(1.03); }
        .checkbox-custom { transition: all 0.2s ease; }
        .checkbox-custom:hover { transform: scale(1.1); }
      `}</style>

      <div className="w-full max-w-2xl">

        {/* ── HEADER ── */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Focus</h1>
              <p className="text-sm text-zinc-500 mono mt-0.5">
                {new Date().toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {streak > 0 && (
                <div className="flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-1.5">
                  <span className="text-sm">🔥</span>
                  <span className="mono text-xs text-amber-300 font-medium">{streak}d streak</span>
                </div>
              )}
              <button onClick={() => { setShowAddForm(p => !p); setTimeout(() => inputRef.current?.focus(), 50); }}
                className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors">
                <span className="text-base leading-none">+</span> New task
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {todayTotal > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-zinc-500 mono">Today's progress</span>
                <span className="text-xs text-zinc-400 mono">{todayDone}/{todayTotal}</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="progress-bar h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full"
                     style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* ── ADD TASK FORM ── */}
        {showAddForm && (
          <div className="bg-zinc-900 border border-zinc-700/60 rounded-xl p-4 mb-5 task-enter">
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTask()}
              placeholder="What needs to be done?"
              className="w-full bg-transparent text-white placeholder-zinc-600 text-sm outline-none mb-4 font-medium" />

            {/* Priority */}
            <div className="flex gap-2 mb-3 flex-wrap">
              {Object.entries(PRIORITIES).map(([k, v]) => (
                <button key={k} onClick={() => setPriority(k)}
                  className={`tag-pill px-3 py-1 rounded-md text-xs font-medium border transition-all ${priority === k ? `${v.bg} ${v.color} ${v.border}` : "bg-zinc-800 text-zinc-500 border-zinc-700 hover:border-zinc-600"}`}>
                  {v.label}
                </button>
              ))}
            </div>

            {/* Tags */}
            <div className="flex gap-2 mb-3 flex-wrap">
              {TAGS.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)}
                  className={`tag-pill px-2.5 py-0.5 rounded-md text-xs border ${selectedTags.includes(tag) ? TAG_COLORS[tag] : "bg-zinc-800 text-zinc-500 border-zinc-700 hover:border-zinc-600"}`}>
                  {tag}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} min={today}
                className="bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 mono px-2.5 py-1.5 outline-none focus:border-zinc-500" />
              <div className="flex gap-2">
                <button onClick={() => setShowAddForm(false)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors">
                  Cancel
                </button>
                <button onClick={addTask}
                  className="text-xs bg-white text-black font-medium px-4 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-30"
                  disabled={!input.trim()}>
                  Add task
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── VIEWS + FILTERS ── */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 gap-0.5">
            {[["today", "Today"], ["all", "All"], ["done", "Done"]].map(([v, l]) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${view === v ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
                {l}
                {v === "today" && todayTotal > 0 && (
                  <span className={`ml-1.5 mono text-[10px] ${view === v ? "text-zinc-300" : "text-zinc-600"}`}>{todayTotal - todayDone}</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Tag filter */}
            {allTags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {allTags.map(tag => (
                  <button key={tag} onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                    className={`tag-pill px-2.5 py-1 rounded-md text-xs border ${filterTag === tag ? TAG_COLORS[tag] : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700"}`}>
                    {tag}
                  </button>
                ))}
              </div>
            )}
            {/* Sort */}
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs rounded-lg px-2.5 py-1.5 outline-none mono hover:border-zinc-700 cursor-pointer">
              <option value="created">Latest</option>
              <option value="priority">Priority</option>
              <option value="due">Due date</option>
            </select>
          </div>
        </div>

        {/* ── TASK LIST ── */}
        <div className="space-y-2">
          {filteredTasks.length === 0 && (
            <div className="text-center py-16">
              <div className="text-3xl mb-3">{view === "done" ? "🎉" : "✦"}</div>
              <p className="text-zinc-600 text-sm">
                {view === "done" ? "Nothing completed yet" : view === "today" ? "Nothing due today" : "All clear"}
              </p>
            </div>
          )}

          {filteredTasks.map((task, i) => {
            const prio     = PRIORITIES[task.priority];
            const dateInfo = task.dueDate ? formatDate(task.dueDate) : null;
            const subtasksDone = task.subtasks.filter(s => s.done).length;
            const isExpanded   = expandedTask === task.id;
            const isCompleting = completingId === task.id;

            return (
              <div key={task.id}
                className={`group task-enter bg-zinc-900 border rounded-xl overflow-hidden transition-all duration-200 hover:border-zinc-700/70 ${isCompleting ? "completing" : ""} ${task.completed ? "border-zinc-800/50" : "border-zinc-800"}`}
                style={{ animationDelay: `${i * 40}ms` }}>

                <div className="flex items-start gap-3 p-3.5">
                  {/* Priority indicator */}
                  <div className={`w-0.5 self-stretch rounded-full mt-0.5 flex-shrink-0 ${prio.dot}`} />

                  {/* Checkbox */}
                  <button onClick={() => toggleTask(task.id)}
                    className={`checkbox-custom mt-0.5 w-4.5 h-4.5 rounded-md border flex-shrink-0 flex items-center justify-center transition-all ${task.completed ? "bg-violet-500 border-violet-500" : "border-zinc-600 hover:border-zinc-400 bg-transparent"}`}
                    style={{ width: 18, height: 18 }}>
                    {task.completed && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug transition-all ${task.completed ? "line-through text-zinc-600" : "text-zinc-100"}`}>
                      {task.text}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {/* Tags */}
                      {task.tags.map(tag => (
                        <span key={tag} className={`px-2 py-0.5 rounded text-[10px] border mono ${TAG_COLORS[tag] || "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
                          {tag}
                        </span>
                      ))}

                      {/* Due date */}
                      {dateInfo && (
                        <span className={`mono text-[10px] ${dateInfo.overdue ? "text-red-400" : dateInfo.soon ? "text-yellow-400" : "text-zinc-500"}`}>
                          {dateInfo.overdue ? "⚠ " : dateInfo.label === "Today" ? "· " : ""}{dateInfo.label}
                        </span>
                      )}

                      {/* Subtasks progress */}
                      {task.subtasks.length > 0 && (
                        <button onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                          className="mono text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors">
                          <span className={`w-1 h-1 rounded-full ${subtasksDone === task.subtasks.length ? "bg-green-400" : "bg-zinc-600"}`} />
                          {subtasksDone}/{task.subtasks.length} subtasks
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                      className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-all text-xs">
                      {isExpanded ? "▲" : "▼"}
                    </button>
                    <button onClick={() => deleteTask(task.id)}
                      className="p-1.5 rounded-lg text-zinc-700 hover:text-red-400 hover:bg-red-400/10 transition-all text-xs">
                      ✕
                    </button>
                  </div>
                </div>

                {/* ── SUBTASKS PANEL ── */}
                {isExpanded && (
                  <div className="border-t border-zinc-800 px-4 py-3 bg-zinc-900/50">
                    <div className="space-y-2 mb-2.5">
                      {task.subtasks.map(sub => (
                        <div key={sub.id} className="flex items-center gap-2.5 group/sub">
                          <button onClick={() => toggleSubtask(task.id, sub.id)}
                            className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-all ${sub.done ? "bg-violet-500/80 border-violet-500" : "border-zinc-600 hover:border-zinc-400"}`}>
                            {sub.done && <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                          </button>
                          <span className={`text-xs flex-1 ${sub.done ? "line-through text-zinc-600" : "text-zinc-400"}`}>{sub.text}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input value={newSubtask[task.id] || ""}
                        onChange={e => setNewSubtask(p => ({ ...p, [task.id]: e.target.value }))}
                        onKeyDown={e => e.key === "Enter" && addSubtask(task.id)}
                        placeholder="Add subtask..."
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 outline-none focus:border-zinc-500" />
                      <button onClick={() => addSubtask(task.id)}
                        className="text-xs bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── STATS FOOTER ── */}
        {tasks.length > 0 && (
          <div className="mt-8 flex items-center justify-between text-[11px] mono text-zinc-600 border-t border-zinc-800/60 pt-4">
            <span>{tasks.filter(t => !t.completed).length} remaining · {tasks.filter(t => t.completed).length} completed</span>
            <button onClick={() => setTasks(p => p.filter(t => !t.completed))}
              className="hover:text-zinc-400 transition-colors">
              Clear completed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}