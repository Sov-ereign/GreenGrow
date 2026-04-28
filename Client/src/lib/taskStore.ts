/**
 * Shared task store — localStorage backed, no backend needed.
 * Used by: ActionCards (Today Tasks card), Sidebar (Activities), Tasks page.
 */

export interface Task {
  id: string;
  label: string;
  time?: string;
  done: boolean;
  priority: "high" | "medium" | "low";
  createdAt: number;
}

const KEY = "gg_tasks_v2";

const DEFAULTS: Task[] = [
  { id: "t1", label: "Water crops (Morning)",        time: "6:00 AM",  done: false, priority: "high",   createdAt: 1 },
  { id: "t2", label: "Inspect tomato for pest signs", time: "8:00 AM",  done: false, priority: "high",   createdAt: 2 },
  { id: "t3", label: "Fertilize potato fields",       time: "10:00 AM", done: false, priority: "medium", createdAt: 3 },
  { id: "t4", label: "Check irrigation schedule",                        done: false, priority: "low",    createdAt: 4 },
];

export const loadTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Task[];
  } catch {}
  saveTasks(DEFAULTS);
  return DEFAULTS;
};

export const saveTasks = (tasks: Task[]): void => {
  try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch {}
};

export const addTask = (label: string, time?: string, priority: Task["priority"] = "medium"): Task[] => {
  const tasks = loadTasks();
  const t: Task = { id: `t-${Date.now()}`, label: label.trim(), time: time?.trim() || undefined, done: false, priority, createdAt: Date.now() };
  const updated = [...tasks, t];
  saveTasks(updated);
  return updated;
};

export const deleteTask = (id: string): Task[] => {
  const updated = loadTasks().filter(t => t.id !== id);
  saveTasks(updated);
  return updated;
};

export const toggleTask = (id: string): Task[] => {
  const updated = loadTasks().map(t => t.id === id ? { ...t, done: !t.done } : t);
  saveTasks(updated);
  return updated;
};

export const getTodayTasks = (): Task[] => loadTasks();

export const getTopPriorityTask = (): Task | null => {
  const tasks = loadTasks().filter(t => !t.done);
  if (tasks.length === 0) return null;
  const order = { high: 0, medium: 1, low: 2 };
  return tasks.sort((a, b) => order[a.priority] - order[b.priority])[0];
};
