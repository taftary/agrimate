import blessed from "blessed";
import { Main } from "../main";
import { Node } from "../nodes/node";
import { Pin } from "../nodes/node/pin";
import { Rule } from "../nodes/node/pin/rules/rule";
import { Plan } from "../nodes/node/pin/plans/plan";
import { logInfo, registerLogger } from "./logger";

/* ---------------------------------------------------------
   DASHBOARD UI
--------------------------------------------------------- */

type PageState = {
  title: string;
  sidebarItems: string[];
  onSelect: (index: number) => void;
  renderContent: () => string;
};

let lastPage: PageState;

const screen = blessed.screen({
  smartCSR: true,
  title: "Nodes Dashboard",
});

/* ---------------- TOP BAR ---------------- */
const topBar = blessed.box({
  top: 0,
  left: 0,
  width: "100%",
  height: 1,
  tags: true,
  style: { fg: "white", bg: "blue" },
  content: "",
});

/* ---------------- SIDEBAR ---------------- */
const sidebar = blessed.list({
  top: 1,
  left: 0,
  width: "25%",
  height: "60%",
  keys: true,
  mouse: true,
  border: "line",
  label: " Navigation ",
  style: {
    selected: { bg: "blue", fg: "white" },
    item: { fg: "cyan" },
  },
  scrollbar: {
    ch: " ",
    track: { bg: "gray" },
    style: { bg: "blue" },
  },
});

/* ---------------- MAIN PANEL ---------------- */
const mainPanel = blessed.box({
  top: 1,
  left: "25%",
  width: "75%",
  height: "60%",
  border: "line",
  label: " Details ",
  tags: true,
  scrollable: true,
  alwaysScroll: true,
  scrollbar: {
    ch: " ",
    track: { bg: "gray" },
    style: { bg: "blue" },
  },
});

function clearMainPanel() {
  mainPanel.children.forEach((c) => c.destroy());
  mainPanel.setContent("");
}

function center(content: string) {
  return `{center}${content}{/center}`;
}

/* ---------------- LOG PANEL ---------------- */
const logBox = blessed.log({
  bottom: 0,
  left: 0,
  width: "100%",
  height: 10,
  border: "line",
  label: " Logs ",
  tags: true,
  scrollable: true,
  alwaysScroll: true,
  keys: true,
  mouse: true,
  vi: true,
  scrollbar: {
    ch: " ",
    track: { bg: "gray" },
    style: { bg: "yellow" },
  },
  style: {
    fg: "white",
  },
});

function updateClock() {
  const page = navStack.length ? navStack[navStack.length - 1].title : "Home";
  topBar.setContent(
    ` {bold}${new Date().toLocaleTimeString()} | ${page}{/bold}`
  );
}

/* ---------------- APPEND ALL ---------------- */
screen.append(topBar);
screen.append(sidebar);
screen.append(mainPanel);
screen.append(logBox);

logBox.setFront();

screen.key(["q", "C-c"], () => process.exit(0));
screen.key("l", () => logBox.focus());

/* ---------------- NAVIGATION ---------------- */
const navStack: PageState[] = [];

function applyPageState(page: PageState) {
  lastPage = page;
  sidebar.setItems(page.sidebarItems);
  sidebar.select(0);
  sidebar.removeAllListeners("select");
  sidebar.on("select", (_, index) => page.onSelect(index));
  clearMainPanel();
  mainPanel.setContent(page.renderContent());
  updateClock();
}

function goTo(
  title: string,
  sidebarItems: string[],
  onSelect: (index: number) => void,
  renderContent: () => string,
  history = true
) {
  const page: PageState = { title, sidebarItems, onSelect, renderContent };
  if (history) {
    navStack.push(page);
  } else {
    navStack[navStack.length - 1] = page;
  }
  applyPageState(page);
}

function goBack() {
  if (navStack.length <= 1) return;
  navStack.pop();
  applyPageState(navStack[navStack.length - 1]);
}

screen.key("backspace", goBack);

/* ---------------- HOME PAGE ---------------- */
function showHome(main: Main) {
  const nodes = main.nodes.list();
  const items = nodes.map((n) => `◆ ${n.name}`);

  goTo(
    "Home",
    items,
    (index) => {
      const node = nodes[index];
      if (node) showNode(node);
    },
    () => center("{bold} HOME {/bold}")
  );
}

/* ---------------- NODE PAGE ---------------- */
function showNode(node: Node) {
  const pins = node.getPins() || [];
  const items = ["← Back", ...pins.map((p) => `● ${p.name}`)];

  goTo(
    `Node: ${node.name}`,
    items,
    (index) => {
      if (index === 0) return goBack();
      const pin = pins[index - 1];
      if (pin) showPin(pin);
    },
    () => center(formatNodeInfo(node))
  );
}

/* ---------------- PIN PAGE ---------------- */
function showPin(pin: Pin) {
  const rules = pin.rules.list();
  const plans = pin.plans.list();

  const items = [
    "← Back",
    ...rules.map((r) => `► Rule: ${r.name}`),
    ...plans.map((p) => `▣ Plan: ${p.name}`),
  ];

  goTo(
    `Pin: ${pin.name}`,
    items,
    (index) => {
      if (index === 0) return goBack();
      const adj = index - 1;
      if (adj < rules.length) showRule(rules[adj]);
      else showPlan(pin, plans[adj - rules.length]);
    },
    () => center(formatPinInfo(pin))
  );
}

/* ---------------- RULE PAGE ---------------- */
function showRule(rule: Rule, history = true) {
  goTo(
    `Rule: ${rule.name}`,
    ["← Back"],
    (index) => index === 0 && goBack(),
    () => center(formatRuleInfo(rule)),
    history
  );

  const isActive = rule.state === "ACTIVE";

  const actionButton = blessed.button({
    mouse: true,
    keys: true,
    shrink: true,
    right: 1,
    bottom: 1,
    content: isActive ? "Deactivate" : "Activate",
    style: {
      bg: isActive ? "red" : "green",
      fg: "white",
      focus: { bg: "blue" },
      hover: { bg: "blue" },
    },
  });

  actionButton.on("press", () => {
    if (rule.state === "ACTIVE") rule.deactivate();
    else rule.activate();

    showRule(rule, false);
    updateClock();
  });

  mainPanel.append(actionButton);
  screen.render();
}

/* ---------------- PLAN PAGE ---------------- */
function showPlan(pin: Pin, plan: Plan, history = true) {
  goTo(
    `Plan: ${plan.name}`,
    ["← Back"],
    (index) => index === 0 && goBack(),
    () => center(formatPlanInfo(plan)),
    history
  );

  // Clear old widgets
  mainPanel.children.forEach((c) => c.destroy());
  mainPanel.setContent(center(formatPlanInfo(plan)));

  /* ---------------- BUTTON FACTORY ---------------- */
  function createButton(
    label: string,
    onPress: () => void,
    left: number | undefined = 0,
    right: number | undefined = undefined
  ) {
    const btn = blessed.button({
      mouse: true,
      keys: true,
      shrink: true,
      bottom: 1,
      right,
      left,
      content: label,
      style: {
        bg: "blue",
        fg: "white",
        hover: { bg: "cyan" },
        focus: { bg: "cyan" },
      },
    });

    btn.on("press", () => {
      onPress();
      showPlan(pin, plan, false); // refresh without adding history
    });

    return btn;
  }

  /* ---------------- BUTTONS BASED ON STATE ---------------- */

  if (plan.state === "SCHEDUAL") {
    mainPanel.append(createButton("Start", () => plan.start(pin), 1));
  }

  if (plan.state === "PAUSED") {
    mainPanel.append(createButton("Resume", () => plan.resume(pin), 1));
  }

  if (plan.state === "ACTIVE") {
    mainPanel.append(createButton("Pause", () => plan.pause(pin), 1));
    mainPanel.append(createButton("Stop", () => plan.stop(pin), 10));
  }

  // NEW RULE: No buttons if DONE or STOPPED
  // (We simply do nothing — no buttons added)

  screen.render();
}

/* ---------------- FORMATTERS ---------------- */
function formatNodeInfo(node: Node) {
  const pins = node.getPins() || [];

  const pinLines = pins
    .map(
      (p) =>
        `   • ● {bold}${p.name}{/bold}  (${p.id})
       State: ${
         p.state === "ON"
           ? "{green-fg}✓ ON{/green-fg}"
           : "{red-fg}✗ OFF{/red-fg}"
       }`
    )
    .join("\n\n");

  return `{bold}{cyan-fg}──────────────────────────────────────────────{/cyan-fg}
◆ Node Information
{cyan-fg}──────────────────────────────────────────────{/cyan-fg}{/bold}

{bold}Name:{/bold} ${node.name}
{bold}ID:{/bold} ${node.id}

{bold}{cyan-fg}──────────────────────────────────────────────{/cyan-fg}
● Pins
{cyan-fg}──────────────────────────────────────────────{/cyan-fg}{/bold}

${pinLines || "   No pins available"}
`;
}

function formatPinInfo(pin: Pin) {
  return `{bold}{yellow-fg}──────────────────────────────────────────────{/yellow-fg}
● Pin Information
{yellow-fg}──────────────────────────────────────────────{/yellow-fg}{/bold}

{bold}Name:{/bold} ${pin.name}
{bold}ID:{/bold} ${pin.id}
{bold}State:{/bold} ${
    pin.state === "ON" ? "{green-fg}✓ ON{/green-fg}" : "{red-fg}✗ OFF{/red-fg}"
  }

{bold}has Rule:{/bold} ${pin.hasRule}
{bold}Active Plans:{/bold} ${pin.plans.hasActivePlan()}
`;
}

function formatRuleInfo(rule: Rule) {
  return `{bold}{magenta-fg}──────────────────────────────────────────────{/magenta-fg}
► Rule Information
{magenta-fg}──────────────────────────────────────────────{/magenta-fg}{/bold}

{bold}Name:{/bold} ${rule.name}
{bold}ID:{/bold} ${rule.id}
{bold}State:{/bold} ${rule.state}
{bold}Priority:{/bold} ${rule.priority}
{bold}to Open:{/bold} ${Array.from(rule.toOpenPins.values())
    .map((pin) => pin.name)
    .join(", ")}
{bold}to Close:{/bold} ${Array.from(rule.toClosePins.values())
    .map((pin) => pin.name)
    .join(", ")}
`;
}

function formatPlanInfo(plan: Plan) {
  const now = Date.now();
  return `{bold}{green-fg}──────────────────────────────────────────────{/green-fg}
▣ Plan Information
{green-fg}──────────────────────────────────────────────{/green-fg}{/bold}

{bold}Name:{/bold} ${plan.name}
{bold}ID:{/bold} ${plan.id}
{bold}State:{/bold} ${plan.state}

{bold}Starts in:{/bold} ${plan.startDate.getTime() - now} ms
{bold}Ends in:{/bold} ${plan.endDate.getTime() - now} ms
`;
}

function reloadPage() {
  if (lastPage) {
    mainPanel.setContent(lastPage.renderContent());
    updateClock();
    screen.render();
  }
}

export function startDashboard(main: Main) {
  registerLogger(logBox, screen);
  showHome(main);
  setInterval(reloadPage, 1000);
}
