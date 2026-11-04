import { connection } from "next/server";
import { MockWallet } from "@/server/mocks";
import { runtime } from "@/server/runtime";

export async function GET() {
  await connection(); // opt out of prerendering: this reads live process state
  const rt = runtime();
  const replies = rt.wallet instanceof MockWallet ? rt.wallet.sent : [];
  return Response.json({ adapters: rt.adapters, orders: rt.deps.store.all(), replies });
}
