export type OrderState =
  | "received" | "parsed" | "validated" | "quoted" | "invoiced"
  | "swapped" | "paid" | "fulfilled" | "replied"
  | "rejected" | "needs_review" | "refunded";

export interface IncomingMemo {
  txid: string;
  outputIndex: number;
  amountZatoshi: bigint;
  memo: string;
}

export interface ParsedOrder {
  query: string;      // e.g. "esim thailand 5gb 7d"
  kind: "esim" | "topup" | "giftcard" | "unknown";
  country?: string;   // ISO alpha-2
  maxUsd: number;
  replyTo: string;    // unified address for the whisper back
}

export interface Candidate {
  productId: string;
  name: string;
  packageValue: string;
  priceUsd: number;
}

export interface InvoiceInfo {
  invoiceId: string;
  accessToken?: string;
  payMethod: string;       // a Bitrefill payment_method id
  payAddress: string;
  payAmount: string;       // in payMethod's unit
  priceUsd: number;
  expiresMinutes?: number;
}

export interface Fulfillment {
  status: "pending" | "complete" | "failed";
  code?: string;           // redemption code / LPA string
  instructions?: string;
}

export interface Shop {
  search(order: ParsedOrder): Promise<Candidate[]>;
  createInvoice(c: Candidate, payMethod: string): Promise<InvoiceInfo>;
  getFulfillment(inv: InvoiceInfo): Promise<Fulfillment>;
}

export interface Swapper {
  /** Swap shielded ZEC into `inv.payMethod`, delivering to `inv.payAddress`. */
  swapAndPay(inv: InvoiceInfo, zatoshiBudget: bigint): Promise<{ ref: string; spentZatoshi: bigint }>;
}

export interface Wallet {
  poll(): Promise<IncomingMemo[]>;
  sendMemo(toUnifiedAddress: string, memo: string, amountZatoshi?: bigint): Promise<string>;
}

export interface Policy {
  maxOrderUsd: number;
  dailyCapUsd: number;
  allowedKinds: ParsedOrder["kind"][];
  /** USD value of 1 ZEC; set by a price source. */
  zecUsd: number;
}
