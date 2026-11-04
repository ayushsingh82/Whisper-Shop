import data from "@/data/proof.json";

/** The real testnet round trip we completed. The txids live in src/data/proof.json; the explorer base URL can be overridden by env. */
const EXPLORER = process.env.NEXT_PUBLIC_EXPLORER_URL ?? "https://testnet.zcashexplorer.app/transactions";

export const explorerUrl = (txid: string) => `${EXPLORER}/${txid}`;

export const PROOF = {
  txs: data.txs.map((t) => ({ ...t, url: `${EXPLORER}/${t.txid}` })),
  purchase: data.purchase,
};
