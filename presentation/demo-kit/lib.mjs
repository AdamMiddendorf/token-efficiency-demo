// Shared helpers for stage.mjs, verify.mjs and race.mjs.
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const KIT_DIR = dirname(fileURLToPath(import.meta.url));
export const REPO_DIR = resolve(KIT_DIR, "..", "..", "parcel-pilot");

// Folders the agent must not see during a demo: the workshop answers and the
// facilitator verification suite. verify/ is copied back in only to score a run.
const HIDDEN = new Set(["workshop", "verify", "coverage", ".git"]);

export function sh(cmd, cwd, { quiet = true } = {}) {
  const r = spawnSync(cmd, { cwd, shell: true, encoding: "utf8" });
  if (!quiet) process.stdout.write((r.stdout ?? "") + (r.stderr ?? ""));
  return { ok: r.status === 0, out: (r.stdout ?? "") + (r.stderr ?? "") };
}

/** Copy parcel-pilot into `dest` without the hidden folders, then commit it. */
export function stageCopy(dest) {
  if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  cpSync(REPO_DIR, dest, {
    recursive: true,
    filter: (src) => {
      // Windows hands the filter long-path ("\\?\D:\...") names; strip that prefix.
      const rel = relative(REPO_DIR, src.replace(/^\\\\\?\\/, ""));
      return !rel || !HIDDEN.has(rel.split(sep)[0]);
    },
  });
  if (!existsSync(join(dest, "node_modules"))) sh("npm install --no-audit --no-fund", dest);
  sh("git init -q", dest);
  sh("git add -A", dest);
  sh('git -c user.name=demo -c user.email=demo@example.com commit -qm "workshop start"', dest);
  sh("git tag workshop/start", dest);
}

/** Copy verify/ in, run one task's verification, remove it again. */
export function verifyTask(dir, task) {
  const target = join(dir, "verify");
  cpSync(join(REPO_DIR, "verify"), target, { recursive: true });
  try {
    return sh(`npm run verify:task-${task}`, dir).ok;
  } finally {
    rmSync(target, { recursive: true, force: true });
  }
}

export function changedFiles(dir) {
  const { out } = sh("git status --porcelain", dir);
  return out.split("\n").map((l) => l.slice(3).trim()).filter(Boolean);
}
