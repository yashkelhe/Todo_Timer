import { useEffect, useState } from "react";
import "./App.css";

function localDateTime(date) {
  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 16);
}

function defaultDeadline() {
  return localDateTime(new Date(Date.now() + 3600000));
}

function formatTime(milliseconds) {
  const total = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  const clock = [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");

  return days ? `${days}d ${clock}` : clock;
}

export default function App() {
  const [task, setTask] = useState("");
  const [deadline, setDeadline] = useState(defaultDeadline);
  const [now, setNow] = useState(Date.now());
  const [message, setMessage] = useState("");

  const [todos, setTodos] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("todos") || "[]");

      return Array.isArray(saved)
        ? saved.filter(
            (todo) =>
              todo &&
              typeof todo.text === "string" &&
              Number.isFinite(todo.deadline)
          )
        : [];
    } catch {
      return [];
    }
  });

  const [purpose, setPurpose] = useState("");
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("todos", JSON.stringify(todos));
    } catch {
      setMessage("Could not save tasks in this browser.");
    }
  }, [todos]);

  function addTodo(event) {
    event.preventDefault();

    const text = task.trim();
    const timestamp = new Date(deadline).getTime();

    if (!text || !Number.isFinite(timestamp)) return;

    if (timestamp <= Date.now()) {
      setMessage("Choose a future deadline.");
      return;
    }

    setTodos((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        text,
        deadline: timestamp,
        completed: false,
      },
    ]);

    setTask("");
    setMessage("");
  }

  function toggleTodo(id) {
    setTodos((previous) =>
      previous.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    );
  }

  function deleteTodo(id) {
    setTodos((previous) => previous.filter((todo) => todo.id !== id));
  }

  function setQuickTime(hours) {
    setDeadline(
      localDateTime(new Date(Date.now() + hours * 3600000))
    );
  }

  return (
    <main className="app">
      <h1>Todo & Counter</h1>

      <section className="panel">
        <h2>Todos</h2>

        <form onSubmit={addTodo} className="todo-form">
          <label>
            Task
            <input
              type="text"
              value={task}
              onChange={(event) => setTask(event.target.value)}
              placeholder="What needs to be done?"
              maxLength={200}
              required
            />
          </label>

          <label>
            Deadline
            <input
              type="datetime-local"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              required
            />
          </label>

          <div className="actions">
            <button type="button" onClick={() => setQuickTime(1)}>
              +1 hour
            </button>

            <button type="button" onClick={() => setQuickTime(24)}>
              +1 day
            </button>

            <button type="button" onClick={() => setQuickTime(168)}>
              +1 week
            </button>

            <button type="submit" className="primary">
              Add task
            </button>
          </div>
        </form>

        {message && (
          <p role="status" className="message">
            {message}
          </p>
        )}

        {todos.length === 0 ? (
          <p className="empty">No tasks yet.</p>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo.id} className="todo-item">
                <input
                  type="checkbox"
                  checked={Boolean(todo.completed)}
                  onChange={() => toggleTodo(todo.id)}
                  aria-label={`Mark ${todo.text} ${
                    todo.completed ? "incomplete" : "complete"
                  }`}
                />

                <div className="todo-content">
                  <span className={todo.completed ? "completed" : ""}>
                    {todo.text}
                  </span>

                  <small>
                    {todo.completed
                      ? "Completed"
                      : todo.deadline <= now
                        ? "Expired"
                        : `${formatTime(todo.deadline - now)} left`}
                  </small>
                </div>

                <button
                  type="button"
                  className="delete"
                  onClick={() => deleteTodo(todo.id)}
                  aria-label={`Delete ${todo.text}`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <h2>Counter</h2>

        <label>
          What for?
          <input
            type="text"
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
            placeholder="e.g. Questions solved, sets, tasks"
            maxLength={100}
          />
        </label>

        <div className="number-counter">
          <button
            type="button"
            className="count-button"
            onClick={() => setCount((previous) => previous - 1)}
            aria-label="Decrease count"
          >
            −
          </button>

          <output className="count-value">{count}</output>

          <button
            type="button"
            className="count-button"
            onClick={() => setCount((previous) => previous + 1)}
            aria-label="Increase count"
          >
            +
          </button>
        </div>

        <button
          type="button"
          className="reset-button"
          onClick={() => setCount(0)}
        >
          Reset
        </button>
      </section>
    </main>
  );
}
