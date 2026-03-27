---
name: cmd_terminal_ui
description: "Guidelines and code templates for creating terminal-style console interfaces for logging and showing real-time task progress in Picare OMS."
---

# Picare CMD Terminal UI Guidelines

This skill defines the pattern for creating "Terminal" or "CMD" style interfaces. These are primarily used in **Modals** or **Side Panels** to display real-time logs, background sync processes, or complex data operations.

## 🎨 Design Principles (Win/Linux Terminal Style)

- **Backdrop**: Ultra-dark glassmorphism (`bg-black/60 shadow-2xl backdrop-blur-sm`).
- **Header**: Mimic a classic window title bar with "Traffic Light" control buttons (red, yellow, green).
- **Typography**: Strictly **Monospace** (`font-mono`) with small, readable sizes (`text-[11px]`).
- **Interaction**: Features an animated blinking cursor (`animate-pulse`) to show "active" status.

## 🏗️ Terminal Component Structure

A typical Terminal UI consists of a container, a title bar, and a scrolled log area.

```tsx
<div className="w-full max-w-lg overflow-hidden rounded-lg border border-white/10 bg-black/60 shadow-2xl backdrop-blur-sm">
  {/* CMD Header */}
  <div className="flex items-center gap-1.5 border-b border-white/5 bg-white/5 px-3 py-1.5">
    <div className="h-2 w-2 rounded-full bg-red-500/50" />
    <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
    <div className="h-2 w-2 rounded-full bg-green-500/50" />
    <span className="ml-2 font-mono text-[10px] text-gray-500">
      process_name.bat
    </span>
  </div>

  {/* Terminal Body */}
  <div className="min-h-32 p-3 font-mono text-[11px] leading-relaxed">
    {logs.map((log, i) => (
      <div
        key={i}
        className={`${log.includes("DONE") ? "text-green-400" : "text-gray-300"}`}
      >
        {log}
      </div>
    ))}
    {/* Animated Cursor */}
    <div className="text-primary inline-block animate-pulse">_</div>
  </div>
</div>
```

## 🛠️ Logic Implementation (React Hooks)

To manage logs effectively, use `useState` and keep only the most recent entries to avoid bloating the UI.

```tsx
const [logs, setLogs] = useState<string[]>([]);
const [isProcessing, setIsProcessing] = useState(false);

const handleProcess = async () => {
    setIsProcessing(true);
    setLogs(["> [SYSTEM] Initializing task..."]);

    const steps = [
        "> [STEP 1] Fetching remote data...",
        "> [STEP 2] Processing batch items...",
        "> [STEP 3] Optimizing local cache...",
        "> [DONE] Task completed successfully.",
    ];

    for (const step of steps) {
        await new Promise(r => setTimeout(r, 800)); // Simulate delay
        setLogs(prev => [...prev.slice(-5), step]); // Keep last 6 lines
    }
    
    setIsProcessing(false);
};
```

## ⚖️ Best Practices

1.  **Line Truncation**: Always slice the logs (`prev.slice(-N)`) to keep the console area concise.
2.  **Color Coding**: Use `text-green-400` for success (`DONE`), `text-red-400` for errors, and `text-yellow-400` for warnings.
3.  **Monospace Only**: Never use sans-serif fonts inside the Terminal body.
4.  **Blur Glassmorphism**: Use `backdrop-blur-sm` or `backdrop-blur-md` on the container to give it a premium depth effect.
5.  **Bat/Exe Labels**: Use realistic file extensions like `.sh`, `.bat`, or `.exe` in the title bar based on the process type.
