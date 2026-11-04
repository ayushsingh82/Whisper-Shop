// Read-only probe: prints the real CLI help so the wallet adapter can be fitted to the installed tool.
// Usage: npx tsx scripts/wallet-check.mts [path-to-zcash-devtool]
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";

const bin = process.argv[2] ?? `${homedir()}/.cargo/bin/zcash-devtool`;
const show = (args: string[]) => {
  console.log(`\n$ zcash-devtool ${args.join(" ")}`);
  try {
    console.log(execFileSync(bin, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }));
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string };
    console.log((err.stdout ?? "") + (err.stderr ?? ""));
  }
};

show(["--help"]);
show(["wallet", "--help"]);
for (const sub of ["init", "sync", "list-tx", "send", "list-addresses", "balance"]) show(["wallet", sub, "--help"]);
console.log("\nNo wallet was created or modified.");
