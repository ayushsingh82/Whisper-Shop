import { simulate } from "@/server/runtime";

export async function POST(req: Request) {
  const { memo, zec } = (await req.json()) as { memo?: string; zec?: number };
  if (typeof memo !== "string" || memo.length > 512) {
    return Response.json({ error: "memo required, max 512 bytes" }, { status: 400 });
  }
  const z = BigInt(Math.round((Number(zec) > 0 ? Number(zec) : 0.05) * 1e8));
  void simulate(memo, z); // runs in the background; the console polls /api/orders
  return Response.json({ accepted: true });
}
