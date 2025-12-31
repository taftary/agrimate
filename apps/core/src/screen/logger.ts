// logger.ts
import blessed from "blessed";

let logBox: blessed.Widgets.Log | null = null;
let screen: blessed.Widgets.Screen | null = null;

// Store logs until dashboard is ready
const history: string[] = [];

// Register the log box when dashboard starts
export function registerLogger(
  box: blessed.Widgets.Log,
  scr: blessed.Widgets.Screen
) {
  logBox = box;
  screen = scr;
}

// Flush history into the log panel
export function checkLogsHistory() {
  if (!logBox) return;

  for (const line of history) {
    logBox.log(line);
  }

  history.length = 0; // clear history
  screen?.render();
}

// Internal helper
function write(msg: string) {
  const formatted = msg;

  if (!logBox) {
    history.push(formatted);
    return;
  }

  logBox.log(formatted);
  screen?.render();
}

// Public API
export function logInfo(...msg: string[]) {
  write(`{green-fg}[INFO]{/green-fg} ${msg.join()}`);
}

export function logWarn(...msg: string[]) {
  write(`{yellow-fg}[WARN]{/yellow-fg} ${msg.join()}`);
}

export function logError(...msg: string[]) {
  write(`{red-fg}[ERROR]{/red-fg} ${msg.join()}`);
}
