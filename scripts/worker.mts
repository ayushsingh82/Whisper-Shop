// Long-running worker: syncs the shop wallet and processes new memos on an interval.
// This is what a host (Railway, Fly, a VPS) keeps alive. Serverless functions are not suitable.
// Usage: npx tsx --env-file=.env.local scripts/worker.mts [seconds]
import { tick } from "../src/server/orchestrator";
import { runtime } from "../src/server/runtime";

const every = Number(process.argv[2] ?? 20) * 1000;
const rt = runtime();
console.log(`worker started. wallet=${rt.adapters.wallet} shop=${rt.adapters.shop} swap=${rt.adapters.swap} interval=${every / 1000}s`);
if (rt.adapters.wallet !== "live") console.warn("WHISPER_WALLET_DIR / WHISPER_IDENTITY not set: polling the simulated wallet.");

let stopping = false;
for (const sig of ["SIGINT", "SIGTERM"] as const) process.on(sig, () => { stopping = true; });

while (!stopping) {
  try {
    const n = await tick(rt.deps);
    if (n > 0) console.log(`${new Date().toISOString()} processed ${n} incoming note(s)`);
  } catch (e) {
    // A failed sync (network, server) must not kill the worker: it retries on the next tick.
    console.error(`${new Date().toISOString()} poll failed: ${(e as Error).message}`);
  }
  await new Promise((r) => setTimeout(r, every));
}
console.log("worker stopped");
