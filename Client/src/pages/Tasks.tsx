import React, { useState, useCallback } from "react";
import {
  ListChecks, Plus, Trash2, CheckCircle2, Circle,
  Clock, Sparkles,
} from "lucide-react";
import {
  loadTasks, addTask, deleteTask, toggleTask, Task,
} from "@/lib/taskStore";

type FilterType = "all" | "today" | "done" | "pending";
type PriorityType = Task["priority"];

const PRIORITY_CONFIG = {
  high:   { label: "High",   color: "text-rose-600",   bg: "bg-rose-100 border-rose-200",   dot: "bg-rose-500" },
  medium: { label: "Medium", color: "text-amber-600",  bg: "bg-amber-100 border-amber-200",  dot: "bg-amber-400" },
  low:    { label: "Low",    color: "text-emerald-600", bg: "bg-emerald-100 border-emerald-200", dot: "bg-emerald-500" },
};

const Tasks: React.FC = () => {
  const [tasks, setTasks]       = useState<Task[]>(() => loadTasks());
  const [filter, setFilter]     = useState<FilterType>("all");
  const [newLabel, setNewLabel] = useState("");
  const [newTime, setNewTime]   = useState("");
  const [newPriority, setNewPriority] = useState<PriorityType>("medium");
  const [showForm, setShowForm] = useState(false);

  const handleAdd = useCallback(() => {
    if (!newLabel.trim()) return;
    setTasks(addTask(newLabel, newTime || undefined, newPriority));
    setNewLabel(""); setNewTime(""); setNewPriority("medium");
    setShowForm(false);
  }, [newLabel, newTime, newPriority]);

  const handleToggle = useCallback((id: string) => setTasks(toggleTask(id)), []);
  const handleDelete = useCallback((id: string) => setTasks(deleteTask(id)), []);

  const filtered = tasks.filter(t => {
    if (filter === "done")    return t.done;
    if (filter === "pending") return !t.done;
    return true;
  });

  const stats = {
    total:   tasks.length,
    done:    tasks.filter(t => t.done).length,
    pending: tasks.filter(t => !t.done).length,
    high:    tasks.filter(t => t.priority === "high" && !t.done).length,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-24">
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-sm">
            <ListChecks className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black">Farm Activities</h1>
            <p className="text-violet-200 text-sm">Plan and track your daily farm tasks</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total",   value: stats.total,   color: "text-white" },
            { label: "Pending", value: stats.pending, color: "text-yellow-300" },
            { label: "Done",    value: stats.done,    color: "text-emerald-300" },
            { label: "Urgent",  value: stats.high,    color: "text-rose-300" },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-2xl p-3 text-center backdrop-blur-sm border border-white/15">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-white/60 font-semibold">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Add Task Button / Form ── */}
      {showForm ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Plus className="h-4 w-4 text-violet-600" /> New Task
          </h3>
          <input
            autoFocus
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            placeholder="Task description…"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400"
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                placeholder="Time (e.g. 8:00 AM)"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50"
              />
            </div>
            <div className="flex gap-2">
              {(["high", "medium", "low"] as PriorityType[]).map(p => (
                <button
                  key={p}
                  onClick={() => setNewPriority(p)}
                  className={`flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    newPriority === p
                      ? `${PRIORITY_CONFIG[p].bg} ${PRIORITY_CONFIG[p].color} border-opacity-100`
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {PRIORITY_CONFIG[p].label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              disabled={!newLabel.trim()}
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add Task
            </button>
            <button
              onClick={() => { setShowForm(false); setNewLabel(""); }}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 bg-white border-2 border-dashed border-violet-200 hover:border-violet-400 rounded-2xl py-3.5 text-violet-600 hover:text-violet-700 font-semibold text-sm transition-all hover:bg-violet-50"
        >
          <Plus className="h-4 w-4" /> Add New Task
        </button>
      )}

      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5">
        {(["all", "pending", "done"] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              filter === f
                ? "bg-violet-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {f} {f === "all" ? `(${stats.total})` : f === "pending" ? `(${stats.pending})` : `(${stats.done})`}
          </button>
        ))}
      </div>

      {/* ── Task list ── */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-violet-400" />
            </div>
            <p className="text-slate-600 font-semibold">No tasks here</p>
            <p className="text-slate-400 text-sm mt-1">
              {filter === "done" ? "Complete some tasks first" : "Add a new task above"}
            </p>
          </div>
        ) : (
          filtered.map(task => {
            const pc = PRIORITY_CONFIG[task.priority];
            return (
              <div
                key={task.id}
                className={`group flex items-start gap-3 bg-white rounded-2xl border shadow-sm p-4 hover:shadow-md transition-all ${
                  task.done ? "border-gray-100 opacity-70" : "border-gray-100"
                }`}
              >
                {/* Toggle */}
                <button
                  onClick={() => handleToggle(task.id)}
                  className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
                >
                  {task.done
                    ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    : <Circle className="h-5 w-5 text-gray-300 group-hover:text-violet-400 transition-colors" />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${task.done ? "line-through text-gray-400" : "text-slate-800"}`}>
                    {task.label}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    {task.time && (
                      <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                        <Clock className="h-3 w-3" /> {task.time}
                      </span>
                    )}
                    <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${pc.bg} ${pc.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${pc.dot}`} />
                      {pc.label}
                    </span>
                    {task.done && (
                      <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ Done
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  aria-label="Delete task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Tasks;
