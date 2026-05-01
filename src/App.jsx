import { useEffect, useState } from "react";

export default function App() {
  const [task, setTask] = useState("");
  const [deadline, setDeadline] = useState("");

  // ✅ Load directly from localStorage (fixes refresh issue)
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem("todos");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ✅ Set default deadline (+1 hour)
  useEffect(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    setDeadline(now.toISOString().slice(0, 16));
  }, []);

  // ✅ Save todos (only when actually changed)
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // ✅ Re-render every second (for countdown)
  useEffect(() => {
    const interval = setInterval(() => {
      setTodos((prev) => [...prev]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addTodo = () => {
    if (!task || !deadline) return;

    const newTodo = {
      id: Date.now(),
      text: task,
      deadline: new Date(deadline).getTime(),
    };

    setTodos((prev) => [...prev, newTodo]);
    setTask("");
  };

  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const setQuickTime = (hours) => {
    const now = new Date();
    now.setHours(now.getHours() + hours);
    setDeadline(now.toISOString().slice(0, 16));
  };

  const getTimeRemaining = (deadline) => {
    const total = deadline - new Date().getTime();

    if (total <= 0) return "⛔ Expired";

    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  // Export todos
  const exportData = () => {
    const blob = new Blob([JSON.stringify(todos)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "todos.json";
    a.click();
  };

  // Import todos
  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        setTodos(data);
      } catch {
        alert("Invalid file");
      }
    };

    reader.readAsText(file);
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h1>⏳ Todo Countdown</h1>

      {/* Input */}
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <input
          type="text"
          placeholder="Enter task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />

        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          style={{ padding: 8 }}
        />

        <button onClick={addTodo}>Add</button>
      </div>

      {/* Quick buttons */}
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setQuickTime(1)}>+1 Hr</button>
        <button onClick={() => setQuickTime(24)}>+1 Day</button>
        <button onClick={() => setQuickTime(168)}>+1 Week</button>
      </div>

      {/* Export / Import */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={exportData}>Export</button>
        <input type="file" onChange={importData} />
      </div>

      {/* Todos */}
      <ul>
        {todos.map((t) => (
          <li key={t.id} style={{ marginBottom: 10 }}>
            <strong>{t.text}</strong>
            <br />⏱ {getTimeRemaining(t.deadline)}
            <br />
            <button onClick={() => deleteTodo(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
