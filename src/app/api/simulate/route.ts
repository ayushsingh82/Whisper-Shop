import { simulate } from "@/server/runtime";

export async function POST(req: Request) {
  const { memo, zec } = (await req.json()) as { memo?: string; zec?: number };
  if (typeof memo !== "string" || memo.length > 512) {
    return Response.json({ error: "memo required, max 512 bytes" }, { status: 400 });
  }
  const z = BigInt(Math.round((Number(zec) > 0 ? Number(zec) : 0.05) * 1e8));
  const { id, run } = await simulate(memo, z);
  void run; // keeps running in the background; clients poll /api/orders
  return Response.json({ accepted: true, id });
}
