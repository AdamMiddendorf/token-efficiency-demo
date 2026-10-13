// The race: the same three tasks, run headless through Claude Code twice, in parallel.
//
//   vibe         one conversation, three vague prompts (vibe-1..3 in prompts.md)
//   disciplined  a fresh conversation per task, six-part prompts (disciplined-1, -2, -4)
//
//   node race.mjs [--model sonnet] [--max-turns 40] [--root <dir>] [--dry-run]
//
// Kick it off at minute 0 of the session; reveal the scoreboard at the end. Each lane
// works in its own throwaway copy of parcel-pilot (no workshop/ or verify/ folders),
// so nothing it does can touch this repository. Results are written to ./results/.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { KIT_DIR, changedFiles, stageCopy, verifyTask } from "./lib.mjs";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const MODEL = opt("model", "sonnet");
const MAX_TURNS = opt("max-turns", "40");
const ROOT = resolve(opt("root", join(tmpdir(), "parcel-pilot-race")));
const DRY_RUN = args.includes("--dry-run");

// Files that genuinely help with tasks 1, 2 and 4 (plus the cheap routing docs).
const RELEVANT = new Set([
  "CLAUDE.md", "AGENTS.md", "docs/architecture.md",
  "docs/decisions/002-pricing-operation-order.md",
  "docs/decisions/003-notification-retries.md",
  "docs/decisions/004-promotions-are-not-pricing.md",
  "src/pricing/calculate-order-total.ts", "tests/pricing/calculate-order-total.test.ts",
  "src/pricing/apply-discount.ts", "src/pricing/pricing-policy.ts",
  "tests/pricing/wholesale-discount.test.ts",
  "src/notifications/retry-policy.ts", "tests/notifications/retry-policy.test.ts",
]);
const EXPECTED_CHANGES = new Set([
  "src/pricing/calculate-order-total.ts", "src/pricing/apply-discount.ts",
  "src/pricing/pricing-policy.ts", "tests/pricing/wholesale-discount.test.ts",
  "src/notifications/retry-policy.ts", "tests/notifications/retry-policy.test.ts",
]);

function loadPrompts() {
  const md = readFileSync(join(KIT_DIR, "prompts.md"), "utf8");
  const prompts = {};
  for (const m of md.matchAll(/<!-- prompt:([\w-]+) -->\s*```text\r?\n([\s\S]*?)```/g)) {
    prompts[m[1]] = m[2].trim();
  }
  return prompts;
}

const HEADLESS_NOTE =
  "\n\n(Headless run: nobody is available to review. Write the plan in your reply, then implement it.)";

function newStats() {
  return {
    costUsd: 0, durationMs: 0, turns: 0, tokensProcessed: 0, peakContext: 0,
    toolCalls: 0, searches: 0, bashCalls: 0, fullTestRuns: 0, focusedTestRuns: 0,
    filesRead: new Set(), touchedArchiveOrFixture: false, prompts: 0,
  };
}

function track(stats, lane, dir, block) {
  if (block.type !== "tool_use") return;
  const input = block.input ?? {};
  const rel = (p) => (p ? relative(dir, resolve(dir, p)).replace(/\\/g, "/") : "");
  stats.toolCalls++;
  let detail = "";
  if (block.name === "Read") {
    const f = rel(input.file_path);
    stats.filesRead.add(f);
    detail = f;
  } else if (block.name === "Grep" || block.name === "Glob") {
    stats.searches++;
    detail = `${input.pattern ?? ""} ${rel(input.path)}`.trim();
  } else if (block.name === "Bash") {
    stats.bashCalls++;
    const cmd = String(input.command ?? "");
    if (/\b(npm (run )?test|vitest)\b/.test(cmd)) {
      if (/(npm (run )?test|vitest( run)?)\s*(-- )?\s*(tests\/|-t )/.test(cmd)) stats.focusedTestRuns++;
      else stats.fullTestRuns++;
    }
    detail = cmd.slice(0, 90);
  } else if (input.file_path) {
    detail = rel(input.file_path);
  }
  if (/archive\/|large-order-history/.test(detail)) stats.touchedArchiveOrFixture = true;
  console.log(`[${lane.padEnd(11)}] ${block.name.padEnd(5)} ${detail}`);
}

function runClaude(lane, dir, prompt, stats, resumeId) {
  const cliArgs = [
    "-p", "--output-format", "stream-json", "--verbose",
    "--model", MODEL, "--max-turns", MAX_TURNS,
    "--permission-mode", "acceptEdits",
    "--allowedTools", "Read,Glob,Grep,Edit,Write,Bash,TodoWrite",
    "--disallowedTools", "WebFetch,WebSearch",
  ];
  if (resumeId) cliArgs.push("--resume", resumeId);
  stats.prompts++;
  console.log(`[${lane.padEnd(11)}] >>> ${prompt.split("\n")[0].slice(0, 80)}`);

  return new Promise((resolveRun, reject) => {
    const child = spawn("claude", cliArgs, { cwd: dir, shell: process.platform === "win32" });
    let sessionId = resumeId;
    let buffer = "";
    child.stdout.on("data", (chunk) => {
      buffer += chunk;
      let nl;
      while ((nl = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line.startsWith("{")) continue;
        let ev;
        try { ev = JSON.parse(line); } catch { continue; }
        if (ev.session_id) sessionId = ev.session_id;
        if (ev.type === "assistant") {
          const u = ev.message?.usage;
          if (u) {
            const ctx = (u.input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0);
            stats.peakContext = Math.max(stats.peakContext, ctx);
          }
          for (const block of ev.message?.content ?? []) track(stats, lane, dir, block);
        } else if (ev.type === "result") {
          const u = ev.usage ?? {};
          stats.costUsd += ev.total_cost_usd ?? 0;
          stats.durationMs += ev.duration_ms ?? 0;
          stats.turns += ev.num_turns ?? 0;
          stats.tokensProcessed += (u.input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0)
            + (u.cache_creation_input_tokens ?? 0) + (u.output_tokens ?? 0);
        }
      }
    });
    child.stderr.on("data", (d) => process.stderr.write(`[${lane}] ${d}`));
    child.on("error", reject);
    child.on("close", () => resolveRun(sessionId));
    child.stdin.end(prompt);
  });
}

async function runLane(lane, steps) {
  const dir = join(ROOT, lane);
  stageCopy(dir);
  const stats = newStats();
  let session;
  for (const step of steps) {
    if (DRY_RUN) { console.log(`[${lane.padEnd(11)}] (dry run) ${step.prompt.split("\n")[0]}`); continue; }
    session = await runClaude(lane, dir, step.prompt, stats, step.fresh ? undefined : session);
  }
  const verified = Object.fromEntries(["1", "2", "4"].map((t) => [t, verifyTask(dir, t)]));
  const changed = changedFiles(dir);
  const read = [...stats.filesRead];
  return {
    lane, dir, ...stats,
    filesRead: read,
    relevantRead: read.filter((f) => RELEVANT.has(f)).length,
    changed,
    unrelatedChanged: changed.filter((f) => !EXPECTED_CHANGES.has(f)),
    verified,
  };
}

const fmt = {
  n: (v) => Math.round(v).toLocaleString("en-GB"),
  k: (v) => `${(v / 1000).toFixed(1)}k`,
  usd: (v) => `$${v.toFixed(2)}`,
  min: (ms) => `${(ms / 60000).toFixed(1)}`,
  pct: (a, b) => (b ? `${Math.round((100 * a) / b)}%` : "-"),
};

function scoreboard(v, d) {
  const rows = [
    ["Prompts sent", v.prompts, d.prompts],
    ["Agent minutes", fmt.min(v.durationMs), fmt.min(d.durationMs)],
    ["Cost (USD)", fmt.usd(v.costUsd), fmt.usd(d.costUsd)],
    ["Tokens processed", fmt.k(v.tokensProcessed), fmt.k(d.tokensProcessed)],
    ["Peak context (tokens)", fmt.k(v.peakContext), fmt.k(d.peakContext)],
    ["Agent turns", v.turns, d.turns],
    ["Files read", v.filesRead.length, d.filesRead.length],
    ["...relevant ratio (target >= 70%)", fmt.pct(v.relevantRead, v.filesRead.length), fmt.pct(d.relevantRead, d.filesRead.length)],
    ["Searches (Grep/Glob)", v.searches, d.searches],
    ["Full / focused test runs", `${v.fullTestRuns} / ${v.focusedTestRuns}`, `${d.fullTestRuns} / ${d.focusedTestRuns}`],
    ["Opened archive/ or big fixture", v.touchedArchiveOrFixture ? "yes" : "no", d.touchedArchiveOrFixture ? "yes" : "no"],
    ["Files changed (unrelated)", `${v.changed.length} (${v.unrelatedChanged.length})`, `${d.changed.length} (${d.unrelatedChanged.length})`],
    ["Task 1 verified (tax)", v.verified["1"] ? "PASS" : "FAIL", d.verified["1"] ? "PASS" : "FAIL"],
    ["Task 2 verified (cap)", v.verified["2"] ? "PASS" : "FAIL", d.verified["2"] ? "PASS" : "FAIL"],
    ["Task 4 verified (retries)", v.verified["4"] ? "PASS" : "FAIL", d.verified["4"] ? "PASS" : "FAIL"],
  ];
  const lines = ["| Metric | Vibe | Disciplined |", "|---|---:|---:|", ...rows.map((r) => `| ${r.join(" | ")} |`)];
  lines.push("", `Model: ${MODEL}. Unrelated files changed - vibe: ${v.unrelatedChanged.join(", ") || "none"}; disciplined: ${d.unrelatedChanged.join(", ") || "none"}.`);
  return lines.join("\n");
}

const prompts = loadPrompts();
for (const id of ["vibe-1", "vibe-2", "vibe-3", "disciplined-1", "disciplined-2", "disciplined-4"]) {
  if (!prompts[id]) throw new Error(`prompts.md is missing <!-- prompt:${id} -->`);
}

console.log(`Race starting - model ${MODEL}, copies under ${ROOT}${DRY_RUN ? " (dry run)" : ""}\n`);
const [vibe, disciplined] = await Promise.all([
  runLane("vibe", [
    { prompt: prompts["vibe-1"], fresh: true },
    { prompt: prompts["vibe-2"] },
    { prompt: prompts["vibe-3"] },
  ]),
  runLane("disciplined", [
    { prompt: prompts["disciplined-1"], fresh: true },
    { prompt: prompts["disciplined-2"] + HEADLESS_NOTE, fresh: true },
    { prompt: prompts["disciplined-4"] + HEADLESS_NOTE, fresh: true },
  ]),
]);

const board = scoreboard(vibe, disciplined);
console.log(`\n${board}\n`);
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const outDir = join(KIT_DIR, "results");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, `race-${stamp}.md`), `# Race ${stamp}\n\n${board}\n`);
writeFileSync(join(outDir, `race-${stamp}.json`), JSON.stringify({ model: MODEL, vibe, disciplined }, null, 2));
console.log(`Saved results/race-${stamp}.md and .json`);
