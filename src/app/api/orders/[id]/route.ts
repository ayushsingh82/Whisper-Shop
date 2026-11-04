import { connection } from "next/server";
import { runtime } from "@/server/runtime";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await ctx.params;
  const rt = runtime();
  const order = rt.deps.store.get(decodeURIComponent(id));
  if (!order) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ adapters: rt.adapters, order });
}
